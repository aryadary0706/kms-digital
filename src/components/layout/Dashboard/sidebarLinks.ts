import {
  LayoutDashboard,
  Home,
  Building2,
  Newspaper,
  UserCog,
  Stethoscope,
  BuildingIcon
} from 'lucide-react';

export const sidebarlink = [
  {
    title: 'Beranda',
    links: [
      { title: 'Dashboard', path: '', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Data Master',
    links: [
      //{ title: 'Nama Kelurahan', path: 'desa', icon: Home },
      { title: 'Posyandu', path: 'posyandu', icon: Building2 },
      { title: 'Artikel', path: 'artikel', icon: Newspaper },
    ],
  },
  {
    title: 'Akun Pengguna',
    links: [
      { title: 'Kader Posyandu', path: 'kader-posyandu', icon: UserCog },
      { title: 'Tenaga Kesehatan', path: 'tenaga-kesehatan', icon: Stethoscope },
      { title: 'Petugas Kelurahan', path: 'petugas-kelurahan', icon: BuildingIcon },
    ],
  },
];
