import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar } from "antd";
import { Menu, X, LogOut, ChevronDown, HelpCircle, Download } from "lucide-react";
import { useSession } from "../../../features/auth/useSession";
import Button from "../../ui/Button";
import { useToast } from "../../ui/Toast";
import ProfileModal from "../../ui/ProfileModal";
import { useTourContext } from "../../../features/tour/TourProvider";

const LINKS_BY_ROLE = {
  ORANG_TUA: [
    { to: "/orangtua/balita", label: "Beranda" },
    { to: "/orangtua/forum", label: "Ajukan Pertanyaan" },
    { to: "/artikel", label: "Artikel" },
  ],
  TENAGA_KESEHATAN: [
    { to: "/tenkes/forum", label: "Forum" },
    { to: "/artikel", label: "Artikel" },
  ],
  DESA: [
    { to: "/desa/beranda", label: "Beranda" },
  ],
  KADER_POSYANDU: [
    { to: "/kader/balita", label: "Beranda" },
    { to: "/kader/orangtua", label: "Akun Orang Tua" },
    { to: "/kader/laporan", label: "Laporan" },
  ],
};

function roleLabel(role) {
  if (!role) return "Tamu";
  if (role === "ORANG_TUA") return "Orang Tua";
  if (role === "KADER_POSYANDU") return "Kader Posyandu";
  if (role === "TENAGA_KESEHATAN") return "Tenaga Kesehatan";
  if (role === "DESA") return "Pemerintah Kelurahan";
  if (role === "ADMIN") return "Admin";
  return role;
}

function BrandMark({ desaName }) {
  return (
    <Link to="/" className="group flex flex-row items-center gap-[10px]">
      <img
        src="/logo-kota-cimahi.jpeg"
        alt="Logo Kota Cimahi"
        className="h-10 w-10 shrink-0 object-contain"
      />
      <span className="flex flex-col leading-[1.1]">
        <span className="text-body-sm font-bold tracking-tight text-deep-slate">
          KMS Digital
        </span>
        <span className="text-caption text-graphite">
          Kelurahan Cibabat
        </span>
      </span>
    </Link>
  );
}

function NavLink({
  to,
  label,
  active,
  onClick,
}: {
  to: string;
  label: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-[13px] py-[8px] text-body-sm font-medium transition-colors ${active ? "text-deep-slate" : "text-graphite hover:text-deep-slate"
        }`}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`absolute left-[13px] right-[13px] -bottom-[14px] h-[3px] rounded-t-full bg-primary-500 transition-opacity duration-150 ${active ? "opacity-100" : "opacity-0"
          }`}
      />
    </Link>
  );
}

export default function NavbarComp({ isLogin }: { isLogin?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 8
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const toast = useToast();
  const { user, role, logout } = useSession();
  const { replay } = useTourContext();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Simpan event install PWA dari browser agar bisa dipicu lewat tombol "Unduh".
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      toast.info("Buka menu browser lalu pilih \"Tambahkan ke Layar Utama\" untuk mengunduh aplikasi.");
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const handleLogout = () => {
    logout();
    toast.success("Berhasil logout");
    navigate("/");
  };

  const handleProfileClick = () => {
    if (role !== "ADMIN") setIsProfileModalOpen(true);
  };

  const navLinks =
    isLogin && role ? LINKS_BY_ROLE[role] ?? [] : [];
  const isActive = (to) => location.pathname.startsWith(to);

  const displayName = user?.name ?? "User";

  const initials =
    displayName
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <>
      {toast.contextHolder}
      <nav
        className={`sticky top-0 z-40 bg-white border-b transition-all duration-200 ${scrolled
            ? "border-light-ash shadow-card"
            : "border-transparent"
          }`}
      >
        <div className="max-w-page mx-auto px-[17px] md:px-[25px]">
          <div className="flex items-center justify-between gap-[17px] h-[72px]">
            <BrandMark desaName={user?.desa_name} />

            <div className="md:hidden flex items-center gap-[8px]">
              {!isLogin && (
                <Button
                  variant="default"
                  size="sm"
                  leadingIcon={<Download size={16} strokeWidth={1.75} />}
                  onClick={handleInstall}
                >
                  Unduh
                </Button>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="flex items-center justify-center w-[44px] h-[44px] rounded-default text-deep-slate hover:bg-faint-fog transition-colors"
                aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X size={22} strokeWidth={2} />
                ) : (
                  <Menu size={22} strokeWidth={2} />
                )}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-[8px] flex-1 justify-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  active={isActive(link.to)}
                />
              ))}
            </div>

            <div className="hidden md:flex items-center gap-[13px]">
              {isLogin ? (
                <>
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex items-center gap-[10px] pl-[8px] pr-[13px] py-[6px] rounded-full border border-light-ash hover:bg-faint-fog hover:border-primary-300 transition-all duration-150"
                  >
                    <Avatar
                      size={32}
                      className="!bg-primary-500 !text-white font-semibold"
                    >
                      {initials}
                    </Avatar>
                    <span className="text-left leading-tight">
                      <span className="block text-body-sm font-semibold text-deep-slate truncate max-w-[140px]">
                        {displayName}
                      </span>
                      <span className="block text-caption text-graphite">
                        {roleLabel(role)}
                      </span>
                    </span>
                    <ChevronDown size={14} strokeWidth={2} className="text-graphite" />
                  </button>
                  <button
                    type="button"
                    onClick={replay}
                    aria-label="Bantuan"
                    title="Lihat tutorial lagi"
                    className="flex items-center justify-center w-[36px] h-[36px] rounded-full text-graphite hover:text-deep-slate hover:bg-faint-fog transition-colors"
                  >
                    <HelpCircle size={18} strokeWidth={1.75} />
                  </button>
                  <Button
                    variant="default"
                    size="sm"
                    leadingIcon={<LogOut size={16} strokeWidth={1.75} />}
                    onClick={handleLogout}
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    leadingIcon={<Download size={16} strokeWidth={1.75} />}
                    onClick={handleInstall}
                  >
                    Unduh
                  </Button>
                  <Link
                    to="/masuk"
                    className="text-body-sm font-semibold text-deep-slate hover:text-primary-600 transition-colors px-[8px]"
                  >
                    Masuk
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/sign-up")}
                  >
                    Daftar Sekarang
                  </Button>
                </>
              )}
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-[21px] space-y-[4px] border-t border-light-ash pt-[13px]">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-[17px] py-[13px] rounded-default text-body-sm font-medium transition-colors ${isActive(link.to)
                      ? "bg-primary-50 text-primary-700 font-semibold"
                      : "text-deep-slate hover:bg-faint-fog"
                    }`}
                >
                  <span>{link.label}</span>
                  {isActive(link.to) && (
                    <span className="w-[6px] h-[6px] rounded-full bg-primary-500" />
                  )}
                </Link>
              ))}

              <div className="pt-[13px] mt-[8px] border-t border-light-ash">
                {isLogin ? (
                  <div className="space-y-[8px]">
                    <button
                      type="button"
                      onClick={() => {
                        handleProfileClick();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-[13px] w-full px-[13px] py-[10px] rounded-default text-body-sm font-medium text-deep-slate hover:bg-faint-fog transition-colors"
                    >
                      <Avatar
                        size={36}
                        className="!bg-primary-500 !text-white font-semibold"
                      >
                        {initials}
                      </Avatar>
                      <span className="flex-1 text-left leading-tight">
                        <span className="block font-semibold text-deep-slate">
                          {displayName}
                        </span>
                        <span className="block text-caption text-graphite">
                          {roleLabel(role)}
                        </span>
                      </span>
                    </button>
                    <Button
                      variant="default"
                      size="md"
                      className="w-full"
                      leadingIcon={<LogOut size={18} strokeWidth={1.75} />}
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                    >
                      Keluar
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[8px]">
                    <Button
                      variant="default"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        navigate("/masuk");
                        setMobileOpen(false);
                      }}
                    >
                      Masuk
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        navigate("/sign-up");
                        setMobileOpen(false);
                      }}
                    >
                      Daftar Sekarang
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        fallbackName={user?.name}
      />
    </>
  );
}
