import { useState } from 'react';
import { X, CreditCard, ShieldCheck, Zap, Lock, Server, Rocket, ArrowLeft, Loader } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';

function PaymentModal({ onClose, onRecharge }) {
  const [step, setStep] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  let cashfree;

  const initializeCashfree = async () => {
    cashfree = await load({ mode: 'sandbox' });
  };
  initializeCashfree();

  const handleOverlayClick = (e) => {
    if (e.target.className.includes('modal-overlay')) {
      onClose();
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep('checkout');
  };

  const handleCashfreePayment = async () => {
    setIsProcessing(true);
    
    // 1. Ask Python Backend to create an order
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_name: selectedPlan.name,
          price: parseInt(selectedPlan.price.replace('$', '')),
          customer_id: 'user_' + Math.floor(Math.random() * 1000000),
          customer_email: 'test@example.com',
          customer_phone: '9999999999'
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // 2. Open Cashfree Checkout Modal
        let checkoutOptions = {
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_modal'
        };
        cashfree.checkout(checkoutOptions).then((result) => {
          if (result.error) {
            console.error(result.error);
            alert("Payment Failed");
          }
          if (result.redirect) {
            console.log("Payment will be redirected");
          }
          if (result.paymentDetails) {
            console.log("Payment has been completed");
            onRecharge();
            onClose();
          }
        });
      } else {
        alert("Payment Error: " + (data.message || "Unknown error occurred."));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to AI backend.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleOverlayClick} className="modal-overlay">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        
        {/* PROMINENT CLOSE BUTTON */}
        <button 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10" 
          onClick={onClose} 
          title="Close Modal"
        >
          <X size={24} />
        </button>
        
        {step === 'plans' ? (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">Select a <span className="text-blue-500">SaaS Plan</span></h2>
              <p className="text-slate-400">Choose the level of defense you need for your platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Initial Plan */}
              <div 
                className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 transition-all flex flex-col group"
                onClick={() => handleSelectPlan({name: 'Initial', price: '$19'})}
              >
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform">
                  <Server size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Initial</h3>
                <div className="text-4xl font-extrabold text-white mb-2">$19<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                <p className="text-slate-400 text-sm mb-6 flex-1">Standard detection and basic API access.</p>
                <button className="w-full py-2.5 bg-slate-800 text-white font-medium rounded border border-slate-700 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">Select</button>
              </div>

              {/* Intermediate Plan */}
              <div 
                className="bg-slate-900 border-2 border-blue-500 rounded-xl p-6 text-center cursor-pointer relative shadow-[0_0_20px_rgba(37,99,235,0.15)] flex flex-col group transform md:-translate-y-2"
                onClick={() => handleSelectPlan({name: 'Intermediate', price: '$49'})}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Recommended
                </div>
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <Zap size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Intermediate</h3>
                <div className="text-4xl font-extrabold text-white mb-2">$49<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                <p className="text-slate-400 text-sm mb-6 flex-1">Advanced XAI Heatmaps & Analytics.</p>
                <button className="w-full py-2.5 bg-blue-600 text-white font-medium rounded shadow-lg shadow-blue-500/25 group-hover:bg-blue-500 transition-colors">Select</button>
              </div>

              {/* Pro Plan */}
              <div 
                className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center cursor-pointer hover:border-slate-600 hover:bg-slate-800/50 transition-all flex flex-col group"
                onClick={() => handleSelectPlan({name: 'Pro', price: '$99'})}
              >
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/10 mb-4 group-hover:scale-110 transition-transform">
                  <Rocket size={24} className="text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pro Tier</h3>
                <div className="text-4xl font-extrabold text-white mb-2">$99<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                <p className="text-slate-400 text-sm mb-6 flex-1">Full Agent Swarms & Active Responses.</p>
                <button className="w-full py-2.5 bg-slate-800 text-white font-medium rounded border border-slate-700 group-hover:bg-purple-600 group-hover:border-purple-500 transition-colors">Select</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 max-w-md mx-auto py-4">
            <div className="text-center space-y-3 relative">
              <button 
                className="absolute left-0 top-1 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full transition-colors" 
                onClick={() => setStep('plans')}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-2xl font-bold text-white tracking-tight"><span className="text-blue-500">{selectedPlan.name} Plan</span> Checkout</h2>
              <p className="text-slate-400">Total due today: <strong className="text-white text-lg">{selectedPlan.price}</strong></p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center shadow-inner">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cashfree_Logo.svg/512px-Cashfree_Logo.svg.png?20200512130030" alt="Cashfree" className="h-10 mx-auto mb-6 opacity-90" />
               <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                 You will be securely redirected to the official Cashfree Sandbox Gateway to complete your {selectedPlan.price} transaction.
               </p>
              
              <button 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                onClick={handleCashfreePayment} 
                disabled={isProcessing}
              >
                {isProcessing ? <><Loader className="animate-spin" size={20} /> Processing...</> : 'Proceed to Official Checkout'}
              </button>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <Lock size={12} /> Secured by <strong className="text-slate-400">Cashfree Payments</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
