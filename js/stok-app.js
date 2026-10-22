
var app = new Vue({
    el: '#app',

    data: {
        upbjjList: data.upbjjList,
        kategoriList: data.kategoriList,
        stok: data.stok.map(item => ({ ...item })),

        filterUpbjj: '',
        filterKategori: '',
        filterStatus: '',
        hanyaReorder: false,
        kataKunci: '',

        sortBy: 'judul',
        sortOrder: 'asc',

        tampilForm: false,
        modeEdit: false,
        kodeEdit: null,
        pesanForm: '',

        form: {}
    },

    computed: {
        // Filter dan sorting digabung agar pengolahan data
        // dilakukan melalui satu computed property.
        stokTerfilter() {
            let hasil = this.stok.filter(item => {
                const cocokUpbjj =
                    !this.filterUpbjj ||
                    item.upbjj === this.filterUpbjj;

                const cocokKategori =
                    !this.filterKategori ||
                    item.kategori === this.filterKategori;

                const status = this.statusStok(item);

                const cocokStatus =
                    !this.filterStatus ||
                    (this.filterStatus === 'Reorder'
                        ? item.qty < item.safety
                        : status === this.filterStatus);

                const cocokReorder =
                    !this.hanyaReorder ||
                    item.qty < item.safety;

                const cari = this.kataKunci.toLowerCase();

                const cocokKataKunci =
                    item.kode.toLowerCase().includes(cari) ||
                    item.judul.toLowerCase().includes(cari);

                return cocokUpbjj &&
                    cocokKategori &&
                    cocokStatus &&
                    cocokReorder &&
                    cocokKataKunci;
            });

            return hasil.sort((a, b) => {
                let nilaiA = a[this.sortBy];
                let nilaiB = b[this.sortBy];

                if (typeof nilaiA === 'string') {
                    nilaiA = nilaiA.toLowerCase();
                    nilaiB = nilaiB.toLowerCase();
                }

                if (nilaiA < nilaiB) {
                    return this.sortOrder === 'asc' ? -1 : 1;
                }

                if (nilaiA > nilaiB) {
                    return this.sortOrder === 'asc' ? 1 : -1;
                }

                return 0;
            });
        },

        jumlahAman() {
            return this.stok.filter(item =>
                item.qty > 0 && item.qty >= item.safety
            ).length;
        },

        jumlahMenipis() {
            return this.stok.filter(item =>
                item.qty > 0 && item.qty < item.safety
            ).length;
        },

        jumlahKosong() {
            return this.stok.filter(item => item.qty === 0).length;
        }
    },

    watch: {
        // Watcher 1: kategori direset jika UT Daerah berubah.
        filterUpbjj() {
            this.filterKategori = '';
        },

        // Watcher 2: memberi informasi ketika pencarian berubah.
        kataKunci() {
            this.pesanForm = '';
        }
    },

    methods: {
        statusStok(item) {
            if (item.qty === 0) {
                return 'Kosong';
            }

            if (item.qty < item.safety) {
                return 'Menipis';
            }

            return 'Aman';
        },

        formatRupiah(nilai) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(nilai);
        },

        resetFilter() {
            this.filterUpbjj = '';
            this.filterKategori = '';
            this.filterStatus = '';
            this.hanyaReorder = false;
            this.kataKunci = '';
            this.sortBy = 'judul';
            this.sortOrder = 'asc';
        },

        formKosong() {
            return {
                kode: '',
                judul: '',
                kategori: '',
                upbjj: '',
                lokasiRak: '',
                harga: 1,
                qty: 0,
                safety: 0,
                catatanHTML: ''
            };
        },

        bukaFormTambah() {
            this.modeEdit = false;
            this.kodeEdit = null;
            this.form = this.formKosong();
            this.pesanForm = '';
            this.tampilForm = true;

            this.$nextTick(() => {
                document.querySelector('.panel form')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        },

        mulaiEdit(item) {
            this.modeEdit = true;
            this.kodeEdit = item.kode;
            this.form = { ...item };
            this.pesanForm = '';
            this.tampilForm = true;

            this.$nextTick(() => {
                document.querySelector('.panel form')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        },

        tutupForm() {
            this.tampilForm = false;
            this.pesanForm = '';
        },

        simpanData() {
            const kode = this.form.kode.trim().toUpperCase();

            if (!kode || !this.form.judul.trim() ||
                !this.form.kategori || !this.form.upbjj ||
                !this.form.lokasiRak.trim()) {
                this.pesanForm = 'Semua data wajib harus diisi.';
                return;
            }

            if (!Number.isFinite(this.form.harga) ||
                this.form.harga <= 0 ||
                !Number.isInteger(this.form.qty) ||
                this.form.qty < 0 ||
                !Number.isInteger(this.form.safety) ||
                this.form.safety < 0) {
                this.pesanForm =
                    'Harga harus lebih dari 0. Stok dan safety stock harus bilangan bulat nonnegatif.';
                return;
            }

            if (!this.kategoriList.includes(this.form.kategori) ||
                !this.upbjjList.includes(this.form.upbjj)) {
                this.pesanForm = 'Kategori atau UT Daerah tidak valid.';
                return;
            }

            if (!this.modeEdit &&
                this.stok.some(item => item.kode === kode)) {
                this.pesanForm = 'Kode mata kuliah sudah digunakan.';
                return;
            }

            const dataBaru = {
                ...this.form,
                kode: kode,
                judul: this.form.judul.trim(),
                lokasiRak: this.form.lokasiRak.trim(),
                catatanHTML: this.form.catatanHTML.trim()
            };

            if (this.modeEdit) {
                const index = this.stok.findIndex(
                    item => item.kode === this.kodeEdit
                );

                if (index !== -1) {
                    this.$set(this.stok, index, dataBaru);
                }
            } else {
                this.stok.push(dataBaru);
            }

            this.tutupForm();
        }
    }
});
