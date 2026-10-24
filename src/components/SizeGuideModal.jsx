import { X } from 'lucide-react'

const SIZES = [
  { size: 'XS', bust: '32"', waist: '24"', hip: '34"', shoulder: '13.5"' },
  { size: 'S',  bust: '34"', waist: '26"', hip: '36"', shoulder: '14"' },
  { size: 'M',  bust: '36"', waist: '28"', hip: '38"', shoulder: '14.5"' },
  { size: 'L',  bust: '38"', waist: '30"', hip: '40"', shoulder: '15"' },
  { size: 'XL', bust: '40"', waist: '32"', hip: '42"', shoulder: '15.5"' },
]

export default function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-fade-up overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#F0EAE0]">
          <h3 className="text-lg font-black text-gray-900">Size Guide</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2 text-left">Size</th>
                <th className="py-2 text-center">Bust</th>
                <th className="py-2 text-center">Waist</th>
                <th className="py-2 text-center">Hip</th>
                <th className="py-2 text-center">Shoulder</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map(row => (
                <tr key={row.size} className="border-t border-[#F0EAE0]">
                  <td className="py-3 font-bold text-[#A9823F]">{row.size}</td>
                  <td className="py-3 text-center text-gray-600">{row.bust}</td>
                  <td className="py-3 text-center text-gray-600">{row.waist}</td>
                  <td className="py-3 text-center text-gray-600">{row.hip}</td>
                  <td className="py-3 text-center text-gray-600">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-gray-400 mt-4">All measurements are in inches. For the best fit, measure yourself and compare with the size chart above.</p>
        </div>
      </div>
    </div>
  )
}
