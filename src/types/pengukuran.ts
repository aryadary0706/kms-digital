export interface Pengukuran {
  id: number;
  id_anak: number;
  date: string;
  berat: number;
  tinggi: number;
  lingkar_kepala: number;
  lingkar_lengan?: number | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}
