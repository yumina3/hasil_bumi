import { Link } from 'react-router';
import { Phone, Mail, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-50 border-t border-green-100">
      <div className="w-full px-4 lg:px-6 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">

          {/* Kiri: Logo, Brand & Caption */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src="/logo_hasil_bumi.png"
                alt="Logo Hasil Bumi"
                className="h-full w-full object-contain transform scale-[3.0] drop-shadow-sm"
              />
            </div>
            <div>
              <h3 className="text-black font-bold text-sm">Hasil Bumi</h3>
              <p className="text-[11px] text-black/50 leading-snug">Segar dari petani, langsung ke dapur Anda.</p>
            </div>
          </div>

          {/* Kanan: Kontak */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-black/80">Kontak Kami</span>
            <div className="flex flex-wrap items-center gap-4">
            <a href="https://instagram.com/hasilbumi.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-black/70 hover:text-green-700 transition-colors">
              <Instagram className="h-3.5 w-3.5" /> @hasilbumi.id
            </a>
            <a href="mailto:info@hasilbumi.id" className="flex items-center gap-1.5 text-xs text-black/70 hover:text-green-700 transition-colors">
              <Mail className="h-3.5 w-3.5" /> info@hasilbumi.id
            </a>
            <a href="tel:+62221234567" className="flex items-center gap-1.5 text-xs text-black/70 hover:text-green-700 transition-colors">
              <Phone className="h-3.5 w-3.5" /> (022) 1234-5678
            </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-4 pt-3 border-t border-green-200/60 text-center">
          <p className="text-[11px] text-black/40">&copy; {currentYear} Hasil Bumi. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
