import { useState } from 'react';
import { X, CreditCard, ShieldCheck, Zap, Lock, Server, Rocket, ArrowLeft, Loader } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';
import './PaymentModal.css';

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
      const response = await fetch('http://localhost:8000/create-order', {
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
        alert("Server Error: Cashfree keys are likely missing from backend.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to AI backend.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={handleOverlayClick}>
      <div className="modal-container glass-panel slide-up">
        
        {/* PROMINENT CLOSE BUTTON */}
        <button className="close-modal-btn" onClick={onClose} title="Close Modal">
          <X size={28} />
        </button>
        
        {step === 'plans' ? (
          <>
            <div className="modal-header">
              <h2>Select a <span className="highlight">SaaS Plan</span></h2>
              <p>Choose the level of defense you need for your platform.</p>
            </div>

            <div className="plans-grid">
              {/* Initial Plan */}
              <div className="plan-card" onClick={() => handleSelectPlan({name: 'Initial', price: '$19'})}>
                <Server size={32} className="text-blue" />
                <h3>Initial</h3>
                <div className="price">$19<span>/mo</span></div>
                <p>Standard detection</p>
                <button className="btn-select">Select</button>
              </div>

              {/* Intermediate Plan */}
              <div className="plan-card featured" onClick={() => handleSelectPlan({name: 'Intermediate', price: '$49'})}>
                <Zap size={32} className="text-purple" />
                <h3>Intermediate</h3>
                <div className="price">$49<span>/mo</span></div>
                <p>Advanced XAI Heatmaps</p>
                <button className="btn-select">Select</button>
              </div>

              {/* Pro Plan */}
              <div className="plan-card" onClick={() => handleSelectPlan({name: 'Pro', price: '$99'})}>
                <Rocket size={32} className="text-pink" />
                <h3>Pro Tier</h3>
                <div className="price">$99<span>/mo</span></div>
                <p>Full Agent Swarms</p>
                <button className="btn-select">Select</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="modal-header">
              <button className="back-btn" onClick={() => setStep('plans')}><ArrowLeft size={20} /></button>
              <h2><span className="highlight">{selectedPlan.name} Plan</span> Checkout</h2>
              <p>Total due today: <strong>{selectedPlan.price}</strong></p>
            </div>

            <div className="checkout-form" style={{ textAlign: 'center' }}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cashfree_Logo.svg/512px-Cashfree_Logo.svg.png?20200512130030" alt="Cashfree" style={{ height: '40px', margin: '0 auto 20px' }} />
               <p style={{ color: '#94a3b8', marginBottom: '20px' }}>You will be securely redirected to the official Cashfree Sandbox Gateway to complete your {selectedPlan.price} transaction.</p>
              
              <button className="btn-pay" onClick={handleCashfreePayment} disabled={isProcessing}>
                {isProcessing ? <Loader className="spin" size={20} /> : 'Proceed to Official Checkout'}
              </button>
              <div className="secure-badge">
                <Lock size={12} /> Secured by <strong>Cashfree Payments</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
