<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('cascade');
            $table->string('nama');
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->text('alamat');
            $table->string('nama_ibu');
            $table->string('no_telp_ortu'); // Digunakan untuk kirim kwitansi WA
            $table->enum('jenjang', ['TK', 'SD', 'SMP', 'SMA_SMK']);
            $table->unsignedInteger('kelas'); // 0 for TK, 1-6 for SD, 7-9 for SMP, 10-12 for SMA/SMK
            $table->foreignId('guru_id')->nullable()->constrained('guru')->nullOnDelete();
            $table->enum('status', ['aktif', 'cuti', 'keluar'])->default('aktif');
            $table->timestamps();
            $table->softDeletes(); // Soft delete: data disembunyikan, riwayat keuangan tetap disimpan

            $table->index(['cabang_id', 'deleted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswa');
    }
};
