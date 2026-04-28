import re
import sys

filename = "src/App.tsx"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Insert PortfolioPage component before `export default function App()`
portfolio_comp = """
const PortfolioPage = () => {
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-[#F0FAF8] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl shadow-sm hover:bg-teal-50 text-teal-950 transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-teal-950 tracking-tighter">Portofolio <span className="text-teal-500 italic">Dosen</span></h1>
            <p className="text-teal-800/60 font-medium mt-1">Jelajahi profil pakar pembimbing dari PTI UNESA.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCcw className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dosenList.map((dosen) => (
              <motion.div 
                key={dosen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-teal-50 group flex flex-col h-full"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-teal-900/10 group-hover:bg-transparent transition-colors z-10" />
                  <img src={dosen.foto || 'https://images.unsplash.com/photo-1544717297-fa154da09f9b?w=400&h=400&fit=crop'} alt={dosen.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-teal-950 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      NIP: {dosen.nip}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-black text-lg text-teal-950 leading-tight mb-2 group-hover:text-teal-600 transition-colors">{dosen.nama}</h3>
                  <div className="mt-auto pt-4 border-t border-teal-50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">Kuota Tersedia</span>
                    <span className="text-sm font-black text-teal-500 bg-teal-50 px-3 py-1 rounded-lg">
                      {dosen.kuotaMax - (dosen._count?.kelompok || 0)} / {dosen.kuotaMax}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App()"""
content = content.replace("export default function App()", portfolio_comp)

# 2. Add route
content = content.replace(
    '<Route path="/admin"',
    '<Route path="/portfolio" element={<PortfolioPage />} />\n          <Route path="/admin"'
)

# 3. Modify LandingPage button
old_button = """<button className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest hover:text-teal-700 transition-colors group px-6 py-3 rounded-full hover:bg-teal-50">
              Jelajahi Profil Dosen"""
new_button = """<button onClick={() => navigate('/portfolio')} className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest hover:text-teal-700 transition-colors group px-6 py-3 rounded-full hover:bg-teal-50">
              Jelajahi Profil Dosen"""
content = content.replace(old_button, new_button)

# 4. Modify Dashboard
# Find Dashboard declaration to add navigate
if "const navigate = useNavigate();" not in content.split("const Dashboard =")[1].split("return")[0]:
    content = content.replace(
        "const Dashboard = ({ user: initialUser, token, onProfileUpdate }: { user: any; token: string; onProfileUpdate: (s: any) => void }) => {",
        "const Dashboard = ({ user: initialUser, token, onProfileUpdate }: { user: any; token: string; onProfileUpdate: (s: any) => void }) => {\n  const navigate = useNavigate();"
    )

old_dashboard_buttons = """Profile Settings
             </button>
          </div>"""
new_dashboard_buttons = """Profile Settings
             </button>
             <button 
               onClick={() => navigate('/portfolio')}
               className="w-full mt-3 py-3 bg-teal-600 text-white border border-teal-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:border-slate-900 transition-all shadow-lg"
             >
               Portofolio Dosen
             </button>
          </div>"""
content = content.replace(old_dashboard_buttons, new_dashboard_buttons)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("App.tsx modified successfully")
