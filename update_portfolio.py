import re

filename = "src/App.tsx"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# The component starts with 'const PortfolioPage = () => {' and ends before 'export default function App() {'
pattern = r"const PortfolioPage = \(\) => \{.*?(?=export default function App\(\) \{)"

new_portfolio = """const PortfolioPage = () => {
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/dosen")
      .then(res => res.json())
      .then(data => {
        setDosenList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredDosen = dosenList.filter(d => d.nama.toLowerCase().includes(searchQuery.toLowerCase()) || d.nip.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#F0FAF8] relative overflow-hidden pb-24">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-orange-200/30 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 relative z-10 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-teal-100 rounded-full mb-6 shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-800">Direktori Pakar Akademik</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-teal-950 tracking-tighter leading-tight mb-6"
        >
          Eksplorasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-400 italic">Portofolio</span><br/>Dosen Ahli.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="text-teal-800/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10"
        >
          Temukan pembimbing skripsi yang paling tepat untuk riset Anda. Lihat profil, spesialisasi, dan ketersediaan kuota secara real-time.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.3 }}
          className="w-full max-w-md relative"
        >
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-teal-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NIP dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-xl border border-teal-100 rounded-[2rem] text-teal-950 font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all placeholder:text-teal-800/30"
          />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-800 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-teal-100 w-fit group">
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCcw className="w-8 h-8 text-teal-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">Memuat Data Server...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredDosen.map((dosen, index) => {
                const kuotaTerpakai = dosen._count?.kelompok || 0;
                const isFull = kuotaTerpakai >= dosen.kuotaMax;

                return (
                  <motion.div 
                    layout
                    key={dosen.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.2)] hover:-translate-y-2 transition-all duration-300 border border-teal-50 group flex flex-col h-full relative"
                  >
                    <div className="aspect-square w-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-950/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity z-10" />
                      <img src={dosen.foto || 'https://images.unsplash.com/photo-1544717297-fa154da09f9b?w=400&h=400&fit=crop'} alt={dosen.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      
                      {/* Badge Top Right */}
                      <div className="absolute top-4 right-4 z-20">
                        {isFull ? (
                          <span className="flex items-center gap-1 bg-rose-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                            <XCircle className="w-3 h-3" /> Penuh
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                            <CheckCircle2 className="w-3 h-3" /> Tersedia
                          </span>
                        )}
                      </div>

                      {/* Info on Image */}
                      <div className="absolute bottom-4 left-4 right-4 z-20">
                        <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded mb-2 border border-white/20">
                          NIP: {dosen.nip}
                        </span>
                        <h3 className="font-black text-xl text-white leading-tight drop-shadow-md">{dosen.nama}</h3>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow bg-white">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-teal-50 text-teal-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-teal-100">
                          Dosen Ahli
                        </span>
                        <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-orange-100">
                          Pembimbing
                        </span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-teal-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase tracking-widest text-teal-800/40 mb-1">Status Kuota</span>
                          <span className="text-sm font-black text-teal-950">
                            {kuotaTerpakai} <span className="text-teal-800/40 text-xs font-bold">/ {dosen.kuotaMax} Terisi</span>
                          </span>
                        </div>
                        <div className={f"w-10 h-10 rounded-xl flex items-center justify-center shadow-inner {'bg-rose-50 text-rose-500' if isFull else 'bg-teal-50 text-teal-500'}"}>
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredDosen.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-teal-300" />
                </div>
                <h3 className="text-xl font-black text-teal-950 mb-2">Dosen Tidak Ditemukan</h3>
                <p className="text-teal-800/60 font-medium text-sm">Coba sesuaikan kata kunci pencarian Anda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

"""

# Because of Python f-string escaping issues, I need to fix the cn() call inside the script manually
# Actually, I should just use standard string formatting or replace.
# In the original JS code:
# cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-inner", isFull ? "bg-rose-50 text-rose-500" : "bg-teal-50 text-teal-500")

new_portfolio = new_portfolio.replace(
    f"{{f\"w-10 h-10 rounded-xl flex items-center justify-center shadow-inner {{'bg-rose-50 text-rose-500' if isFull else 'bg-teal-50 text-teal-500'}}\"}}",
    "{cn(\"w-10 h-10 rounded-xl flex items-center justify-center shadow-inner\", isFull ? \"bg-rose-50 text-rose-500\" : \"bg-teal-50 text-teal-500\")}"
)

updated_content = re.sub(pattern, new_portfolio, content, flags=re.DOTALL)

with open(filename, "w", encoding="utf-8") as f:
    f.write(updated_content)

print("UI Updated successfully")
