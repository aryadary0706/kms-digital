import React from 'react';
import dayjs from 'dayjs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { classifyAll, classifyGizi, indicatorLabel } from '../pengukuran/statusGizi';
import { computeAllZScores } from '../pengukuran/zScore';

const toZ = (v) => (v == null || v === '' ? null : Number(v));

export default function RiwayatCard({ pengukuran, anak = null, onEdit, onDelete, canEdit = true }) {
  const {
    date,
    berat,
    tinggi,
    lingkar_kepala: lingkarKepala,
    lila,
    catatan,
    z_score_berat,
    z_score_tinggi,
    z_score_lingkar_kepala,
    z_score_gizi,
  } = pengukuran;

  // Hitung ulang dari data mentah + tanggal lahir terkini (sama seperti ChartWHO),
  // supaya badge tidak basi bila tanggal lahir/gender anak diubah setelah pengukuran disimpan.
  // Fallback ke z-score tersimpan bila data anak belum tersedia.
  const zScores =
    anak?.gender && anak?.tanggal_lahir && date
      ? computeAllZScores({
          berat: toZ(berat),
          tinggi: toZ(tinggi),
          lingkarKepala: toZ(lingkarKepala),
          gender: anak.gender,
          tanggalLahir: anak.tanggal_lahir,
          tanggalPengukuran: dayjs(date).format('YYYY-MM-DD'),
        })
      : {
          zScoreBB: toZ(z_score_berat),
          zScoreTB: toZ(z_score_tinggi),
          zScoreLK: toZ(z_score_lingkar_kepala),
          zScoreGizi: toZ(z_score_gizi),
        };

  const { bbu, tbu, lku } = classifyAll(zScores);
  const gizi = classifyGizi(zScores.zScoreGizi);

  return (
    <Card>
      <div className="flex justify-between items-start gap-3 mb-3 flex-wrap">
        <div className="text-heading-sm font-semibold text-deep-slate">
          {date ? dayjs(date).format('DD MMMM YYYY') : '-'}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <StatusBadge status={gizi} label={indicatorLabel('gizi', gizi)} />
          <StatusBadge status={tbu} label={indicatorLabel('tbu', tbu)} />
          <StatusBadge status={bbu} label={indicatorLabel('bbu', bbu)} />
          <StatusBadge status={lku} label={indicatorLabel('lku', lku)} />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-3 text-base">
        <div>
          <strong>BB:</strong> {berat} kg
        </div>
        <div>
          <strong>TB:</strong> {tinggi} cm
        </div>
        <div>
          <strong>LK:</strong> {lingkarKepala} cm
        </div>
        {lila != null && (
          <div>
            <strong>LILA:</strong> {lila} cm
          </div>
        )}
      </div>

      {catatan && (
        <div className="px-[17px] py-[13px] bg-polar-mist rounded-default text-body-sm text-deep-slate mb-[13px]">
          {catatan}
        </div>
      )}

      {canEdit && (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(pengukuran)}>
            Ubah
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete?.(pengukuran)}>
            Hapus
          </Button>
        </div>
      )}
    </Card>
  );
}
