# BE-Transaction-Service
Interview Project : High-Reliability Transaction Service

# Techonology
- Node Js v22.12.0
- Express Js
- PostgreeSQL ([Scema SQL](https://github.com/fanfantasi/Transaction-service/blob/Master/Scema%20SQL))

# Run Apps
- Dev (npm run start:dev)
- Build for Production (npm run build -> npm run start)
- Documentation API ([Postman](https://jhc777.postman.co/workspace/JHC-Workspace~68776dfb-8841-400d-9a80-4fe4f0f833e3/collection/1658865-c3baabe9-0756-4340-96ad-2ded063a271b?action=share&creator=1658865))


1. Deskripsi Sistem
    Sistem ini merupakan platform keuangan sederhana yang memungkinkan user untuk:
    - Mendaftar dan login
    - Deposit saldo
    - Spend / pengeluaran saldo
    - Withdraw saldo

    Melihat saldo dan transaksi (ledger)
    Sistem menjamin:
    Konsistensi data: saldo tidak boleh negatif, transaksi dicatat di ledger
    Atomicity transaksi: deposit, spend, withdraw menggunakan transaction PostgreSQL
    Aman dari double-spending dan SQL Injection
    Audit dan tracing: semua request dan transaksi dicatat dengan requestId dan transactionId
2. Struktur Database (ada di file scema.sql / SQL created di repo ini)
3. Design System yang dibuat
    - Register User
        1. User mendaftar → user dibuat + wallet dibuat
        2. Wallet balance default 0
        3. Transaksi ini dilakukan dalam 1 transaction untuk menjamin atomicity
    - Deposit
        1. User hanya mengirim amount dan referenceId
        2. Backend ambil wallet berdasarkan userId dari token yang dikirim (payload token)
        3. (SELECT ... FOR UPDATE) → mengunci wallet agar aman concurrent request
        4. Update saldo + insert ledger entry → commit transaction
    - Spend (Pengeluaran)
        1. Langkahnya hampir sama dengan deposit tapi saldo dikurangi (saldo awal di kurangi amount)
        2. Mengecek saldo cukup sebelum update (Jika saldo tidak cukup → rollback)
        3. Ledger mencatat saldo akhir
    - Withdraw (Tidak diintegrasikan dengan external)
        1. Sama seperti spend
        2. Saldo dikurangi, ledger dicatat
        3. Jika saldo tidak cukup → rollback
    - Logging/Tracing
        1. Middleware requestId otomatis untuk setiap request
        2. Helper log() untuk mencatat semua aktivitas kritis
        3. Semua log disimpan di tabel logs
        4. Audit trail lengkap untuk transaksi dan error
4. Penanganan Failure
    1. Wallet tidak ditemukan -> Deposit/Spend/Withdraw gagal → response error 400
    2. Saldo tidak cukup -> Spend/Withdraw gagal → rollback transaction
    3. Duplicate referenceId -> Deposit/Spend idempotent → rollback dan response error 400
    4. Error di tengah transaksi -> ROLLBACK → saldo dan ledger tetap konsisten
    5. Token expired / invalid -> Auth middleware → 401 Unauthorized, dicatat di log
    6. Request error -> Dicatat di logs → level warn atau error
5. Validation Input
    1. Deposit -> Check ReferensiId dan amount
    2. Spend -> Check ReferensiId, amount dan walletId
    3. Withdraw -> Check ReferensiId, amount dan walletId
    4. Password -> Panjang 8 - 16 Karakter, Minimal 1 Huruf besar, 1 huruf kecil dan juga special character
6. Keamanan (Best Practice)
    1. WallteId tidak kirim (tidak ditentukan oleh Frontend), selalu di check dan diambil dari userId JWT
    2. Ledger entry pakai ReferensiId uniq -> cegah double
    3. semua transaksi atomic untuk mencegah saldo menjadi negatif
    4. token JWT validasi di middleware dan expired di handle langsung
