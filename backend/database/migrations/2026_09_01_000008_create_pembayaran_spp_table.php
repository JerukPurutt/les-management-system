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
        Schema::create('pembayaran_spp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('cascade');
            $table->unsignedSmallInteger('bulan'); // 1-12
            $table->unsignedSmallInteger('tahun'); // e.g. 2026
            $table->decimal('nominal', 12, 2);
            $table->enum('status', ['belum_bayar', 'lunas'])->default('belum_bayar');
            $table->string('nama_pembayar')->nullable();
            $table->date('tanggal_bayar')->nullable();
            $table->string('no_kwitansi')->nullable();
            $table->string('kwitansi_url')->nullable();
            $table->timestamp('dikirim_at')->nullable();
            $table->timestamps();

            // Constraint unik pencegah tagihan ganda (Idempotensi Cron Job)
            $table->unique(['siswa_id', 'bulan', 'tahun'], 'unique_spp_siswa_bulan_tahun');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran_spp');
    }
};
