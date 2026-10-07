<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SiswaController extends Controller
{
    /**
     * Assign teacher to student with strict database transaction locking.
     * Prevents race conditions from assigning a 7th student concurrently.
     */
    public function assignGuru(Request $request, Siswa $siswa)
    {
        $validated = $request->validate([
            'guru_id' => 'nullable|exists:guru,id',
        ]);

        $guruId = $validated['guru_id'];

        return DB::transaction(function () use ($siswa, $guruId) {
            if ($guruId) {
                // Lock teacher row for update
                $guru = Guru::where('id', $guruId)->lockForUpdate()->firstOrFail();

                // 1. Rule: Grade Match Check
                if ($guru->jenjang !== $siswa->jenjang) {
                    throw ValidationException::withMessages([
                        'guru_id' => ["Guru jenjang {$guru->jenjang} tidak cocok untuk siswa jenjang {$siswa->jenjang}."],
                    ]);
                }

                // 2. Rule: Hard capping max 6 active students across ALL branches
                $assignedStudentsCount = Siswa::where('guru_id', $guruId)
                    ->where('id', '!=', $siswa->id)
                    ->where('status', '!=', 'keluar')
                    ->whereNull('deleted_at')
                    ->lockForUpdate()
                    ->count();

                if ($assignedStudentsCount >= 6) {
                    throw ValidationException::withMessages([
                        'guru_id' => ["Penugasan ditolak! Guru {$guru->nama} sudah mengajar 6/6 siswa."],
                    ]);
                }
            }

            $siswa->update(['guru_id' => $guruId]);

            return response()->json([
                'success' => true,
                'message' => 'Penugasan guru berhasil diperbarui.',
                'data' => $siswa->fresh(['guru']),
            ]);
        });
    }

    /**
     * Change student status. If 'keluar', automatically release teacher & schedule slot.
     */
    public function updateStatus(Request $request, Siswa $siswa)
    {
        $validated = $request->validate([
            'status' => 'required|in:aktif,cuti,keluar',
        ]);

        return DB::transaction(function () use ($siswa, $validated) {
            $newStatus = $validated['status'];

            $updateData = ['status' => $newStatus];

            if ($newStatus === 'keluar') {
                // Release teacher assignment so slot becomes free
                $updateData['guru_id'] = null;
                // Delete existing schedules
                $siswa->jadwal()->delete();
            }

            $siswa->update($updateData);

            return response()->json([
                'success' => true,
                'message' => "Status siswa berhasil diubah menjadi {$newStatus}.",
                'data' => $siswa->fresh(),
            ]);
        });
    }
}
