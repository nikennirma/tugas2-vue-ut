var trackingApp = new Vue({
    el: '#app',

    data: {
        tracking: data.tracking,
        paketList: data.paket,
        stokList: data.stok,

        ekspedisiList: [
            'JNE Regular',
            'JNE Express'
        ],

        form: {
            nim: '',
            nama: '',
            ekspedisi: '',
            paket: '',
            tanggalKirim: ''
        },

        nomorDO: '',
        nomorDOHasil: '',
        doTerpilih: null,
        pesan: '',
        pesanForm: ''
    },

    computed: {
        // Paket yang sedang dipilih pengguna.
        paketTerpilih() {
            return this.paketList.find(
                item => item.kode === this.form.paket
            ) || null;
        },

        // Nomor DO dibuat berdasarkan tahun berjalan.
        nomorDOBaru() {
            const tahun = new Date().getFullYear();
            const prefix = 'DO' + tahun + '-';

            const nomorTerbesar = Object.keys(this.tracking)
                .filter(nomor => nomor.startsWith(prefix))
                .reduce((terbesar, nomor) => {
                    const sequence = Number(
                        nomor.substring(prefix.length)
                    );

                    return Number.isFinite(sequence)
                        ? Math.max(terbesar, sequence)
                        : terbesar;
                }, 0);

            return prefix +
                String(nomorTerbesar + 1).padStart(3, '0');
        }
    },

    methods: {
        tanggalLokal() {
            const sekarang = new Date();
            const tahun = sekarang.getFullYear();
            const bulan = String(
                sekarang.getMonth() + 1
            ).padStart(2, '0');
            const tanggal = String(
                sekarang.getDate()
            ).padStart(2, '0');

            return `${tahun}-${bulan}-${tanggal}`;
        },

        formatRupiah(nilai) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(nilai);
        },

        judulBahanAjar(kode) {
            const bahan = this.stokList.find(
                item => item.kode === kode
            );

            return bahan ? bahan.judul : 'Nama bahan ajar tidak tersedia';
        },

        tambahDO() {
            this.pesanForm = '';

            if (
                !this.form.nim ||
                !this.form.nama ||
                !this.form.ekspedisi ||
                !this.paketTerpilih ||
                !this.form.tanggalKirim
            ) {
                this.pesanForm = 'Lengkapi semua data terlebih dahulu.';
                return;
            }

            // Simpan nomor DO yang sedang dibuat.
            const nomor = this.nomorDOBaru;

            // Harga diambil dari objek paket, bukan input pengguna.
            const paket = this.paketTerpilih;

            const doBaru = {
                nim: this.form.nim,
                nama: this.form.nama,
                status: 'Dalam Proses',
                ekspedisi: this.form.ekspedisi,
                tanggalKirim: this.form.tanggalKirim,
                paket: paket.kode,
                total: paket.harga,
                perjalanan: []
            };

            // Vue 2: gunakan $set untuk menambahkan key objek reaktif.
            this.$set(this.tracking, nomor, doBaru);

            // Tampilkan DO yang baru disimpan.
            this.nomorDO = nomor;
            this.nomorDOHasil = nomor;
            this.doTerpilih = doBaru;
            this.pesan = '';

            // Siapkan form untuk input berikutnya.
            this.form = {
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: this.tanggalLokal()
            };

            this.pesanForm = 'Delivery Order berhasil ditambahkan.';
        },

        cariDO() {
            const nomor = this.nomorDO.trim().toUpperCase();

            this.pesan = '';
            this.doTerpilih = null;
            this.nomorDOHasil = '';

            if (!nomor) {
                this.pesan = 'Masukkan nomor Delivery Order.';
                return;
            }

            const hasil = this.tracking[nomor];

            if (!hasil) {
                this.pesan = 'Nomor Delivery Order tidak ditemukan.';
                return;
            }

            this.nomorDOHasil = nomor;
            this.doTerpilih = hasil;
        }
    },

    created() {
        this.form.tanggalKirim = this.tanggalLokal();
    }
});