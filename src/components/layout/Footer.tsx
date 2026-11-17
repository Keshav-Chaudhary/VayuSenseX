import React from 'react';
import { ShieldCheck, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-midnight-950 py-10 mt-auto text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-base mb-2">
              <span className="text-cyan-400">VayuSense</span>X
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Understand the air. Protect your world. A deterministic and AI-powered household environmental decision platform for severe winter smog and urban pollution.
            </p>
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WCAG 2.2 AA Compliant</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Engines</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-cyan-400 transition-colors">CPCB NAQI (India) Engine</li>
              <li className="hover:text-cyan-400 transition-colors">US EPA AQI Engine</li>
              <li className="hover:text-cyan-400 transition-colors">Boundary Layer Inversion Heuristics</li>
              <li className="hover:text-cyan-400 transition-colors">EPA Inhaled Particulate Dose</li>
              <li className="hover:text-cyan-400 transition-colors">Indoor Air Mass-Balance Differential</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Official Data Sources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="flex items-center hover:text-cyan-400 transition-colors">
                  <span>Open-Meteo & CAMS</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://cpcb.nic.in" target="_blank" rel="noreferrer" className="flex items-center hover:text-cyan-400 transition-colors">
                  <span>CPCB Guidelines</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://www.epa.gov/air-quality" target="_blank" rel="noreferrer" className="flex items-center hover:text-cyan-400 transition-colors">
                  <span>US EPA Technical Assistance</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://www.who.int/health-topics/air-pollution" target="_blank" rel="noreferrer" className="flex items-center hover:text-cyan-400 transition-colors">
                  <span>WHO Air Quality Guidelines</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Ethics & Transparency</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              The deterministic engine owns the numbers. AI owns the explanations. The user owns the decisions.
            </p>
            <p className="text-[11px] text-slate-500">
              Modelled calculations are scientific estimates for routine optimization and do not constitute clinical or medical diagnosis.
            </p>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} VayuSenseX · Challenge 6: Urban Air Quality Assistant. Built with React 19 & TypeScript.
          </div>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="inline-flex items-center text-cyan-400 font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 mr-1" /> Zero Hallucination Number Guard
            </span>
            <span>Local-First Guest Mode</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
