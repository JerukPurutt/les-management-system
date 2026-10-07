<?php

namespace App\Services;

use App\Models\Siswa;
use App\Models\PembayaranSPP;
use App\Models\TarifSPP;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SPPBillingService
{
    /**
     * Generate monthly SPP bills for all active students on the 1st of the month.
     * Idempotent: Executing multiple times will skip already generated bills.
     */
    public function generateMonthlyBills(int $bulan, int $tahun): array
    {
        $createdCount = 0;
        $skippedCount = 0;

        // Fetch all active, non-deleted students
        $activeStudents = Siswa::where('status', 'aktif')
            ->whereNull('deleted_at')
            ->get();

        foreach ($activeStudents as $siswa) {
            DB::beginTransaction();
            try {
                // Check if bill already exists for this student & month/year
                $exists = PembayaranSPP::where('siswa_id', $siswa->id)
                    ->where('bulan', $bulan)
                    ->where('tahun', $tahun)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    $skippedCount++;
                    DB::rollBack();
                    continue;
                }

                // Determine active rate for student's grade
                $nominal = $this->resolveSPPRate($siswa->jenjang, $siswa->kelas);

                PembayaranSPP::create([
                    'siswa_id'   => $siswa->id,
                    'cabang_id'  => $siswa->cabang_id,
                    'bulan'      => $bulan,
                    'tahun'      => $tahun,
                    'nominal'    => $nominal,
                    'status'     => 'belum_bayar',
                ]);

                $createdCount++;
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Failed to generate SPP for student {$siswa->id}: " . $e->getMessage());
            }
        }

        return [
            'created' => $createdCount,
            'skipped' => $skippedCount,
        ];
    }

    /**
     * Resolve SPP rate based on student grade
     */
    public function resolveSPPRate(string $jenjang, int $kelas): float
    {
        $tarif = TarifSPP::where('jenjang', $jenjang)
            ->where('kelas_min', '<=', $kelas)
            ->where('kelas_max', '>=', $kelas)
            ->first();

        if ($tarif) {
            return (float) $tarif->nominal;
        }

        // Fallback default rates according to SRS section 2
        switch ($jenjang) {
            case 'TK':
                return 150000;
            case 'SD':
                return $kelas <= 3 ? 150000 : 175000;
            case 'SMP':
                return 200000;
            case 'SMA_SMK':
                return 225000;
            default:
                return 150000;
        }
    }
}
