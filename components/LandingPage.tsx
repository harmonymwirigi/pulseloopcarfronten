import React, { useState, useEffect, useCallback } from 'react';
import AuthModal from './AuthModal';
import PrivacyPolicy from './PrivacyPolicy';

const testimonials = [
    { 
        quote: "PulseLoopCare has become an indispensable tool for my practice. The ability to quickly get a second opinion on a complex case from a trusted network is invaluable.",
        name: "Dr. Emily Carter",
        role: "Cardiologist",
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop"
    },
    { 
        quote: "The AI-assisted diagnostics have genuinely surprised me with their accuracy. It's like having a brilliant research assistant available 24/7.",
        name: "Dr. Ben Harrison",
        role: "Neurologist",
        avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2564&auto=format&fit=crop"
    },
    { 
        quote: "As a recent graduate, the resource hub and the mentorship I've found on this platform have been instrumental in building my confidence and skills.",
        name: "Dr. Maria Garcia",
        role: "General Practitioner",
        avatarUrl: "https://images.unsplash.com/photo-1537368910025-7003507965b6?q=80&w=2570&auto=format&fit=crop"
    }
];

const LandingPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');
    const [invitationToken, setInvitationToken] = useState<string | null>(null);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [showPolicy, setShowPolicy] = useState(false);

    const openModal = (mode: 'login' | 'signup', token: string | null = null) => {
        setModalMode(mode);
        setInvitationToken(token);
        setIsModalOpen(true);
    };
    
    const viewPolicy = () => {
        setIsModalOpen(false);
        setShowPolicy(true);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            // Remove token from URL to keep it clean, but keep it in state
            window.history.replaceState({}, document.title, window.location.pathname);
            openModal('signup', token);
        }
    }, []);
    
    const nextTestimonial = useCallback(() => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, []);

    const prevTestimonial = () => {
        setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            nextTestimonial();
        }, 5000);
        return () => clearInterval(timer);
    }, [nextTestimonial]);

    if (showPolicy) {
        return <PrivacyPolicy onClose={() => setShowPolicy(false)} />;
    }

    return (
        <div className="bg-white font-sans">
            {isModalOpen && <AuthModal initialMode={modalMode} onClose={() => setIsModalOpen(false)} invitationToken={invitationToken} onViewPolicy={viewPolicy} />}
            
            {/* Header */}
            <header className="absolute top-0 left-0 w-full z-10 py-4 px-4 sm:px-8">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        <h1 className="text-2xl font-bold text-gray-800">PulseLoopCare</h1>
                    </div>
                    <div className="space-x-2">
                        <button onClick={() => openModal('login')} className="px-4 py-2 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors">Login</button>
                        <button onClick={() => openModal('signup')} className="px-4 py-2 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 transition-colors">Sign Up</button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2728&auto=format&fit=crop')" }}>
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-10 px-4">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">The Collaborative Heartbeat of Modern Medicine</h2>
                        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">A secure, AI-enhanced platform for medical professionals to share insights, accelerate solutions, and shape the future of patient care.</p>
                        <button onClick={() => openModal('signup')} className="px-8 py-3 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 transition-transform hover:scale-105 text-lg">Join the Community</button>
                    </div>
                </section>

                {/* How it Works Section */}
                 <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 text-center">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">Get Started in 3 Simple Steps</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-12">Join our network and start collaborating in minutes.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                           <HowItWorksStep 
                                step="1" 
                                title="Create Your Profile" 
                                description="Sign up and join a verified network of healthcare professionals."
                                imageUrl="https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?q=80&w=2574&auto=format&fit=crop"
                            />
                           <HowItWorksStep 
                                step="2" 
                                title="Collaborate & Discuss" 
                                description="Share cases, ask questions, and contribute your expertise in a secure environment."
                                imageUrl="https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=2652&auto=format&fit=crop"
                            />
                           <HowItWorksStep 
                                step="3" 
                                title="Innovate & Learn" 
                                description="Access shared resources, discover AI-driven insights, and grow professionally."
                                imageUrl="https://images.unsplash.com/photo-1614935151651-0bea65084324?q=80&w=2591&auto=format&fit=crop"
                            />
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 text-center">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">The Future of Medical Teamwork</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-12">PulseLoopCare provides the tools you need to connect with peers, access vital resources, and stay at the forefront of medical innovation.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l4 4m0 0l4 4m-4-4v12m-4-4l-4 4m0 0l-4 4m4-4V3" /></svg>}
                                title="AI-Powered Insights"
                                description="Leverage cutting-edge AI to analyze case data, identify patterns, and receive suggestions for differential diagnoses and treatment plans."
                            />
                            <FeatureCard 
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                title="Secure Peer Network"
                                description="Connect and collaborate with a verified network of healthcare professionals. Discuss complex cases in a secure, compliant environment."
                            />
                            <FeatureCard 
                                icon={<svg xmlns="http://www.w.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h9M7 16h6M7 12h6M7 8h6" /></svg>}
                                title="Shared Resource Hub"
                                description="Access and contribute to a growing library of articles, research papers, and best-practice guidelines shared by the community."
                            />
                        </div>
                    </div>
                </section>
                
                {/* AI Integration Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="pr-8">
                                <span className="text-teal-500 font-semibold uppercase tracking-wider">AI Integration</span>
                                <h3 className="text-4xl font-bold text-gray-800 mt-2 mb-4">Unlock Deeper Insights with AI</h3>
                                <p className="text-gray-600 mb-8">Our platform integrates state-of-the-art AI to help you analyze complex cases, identify subtle patterns, and accelerate the path to accurate diagnoses. Go beyond the data and uncover connections you might have missed.</p>
                                <ul className="space-y-6">
                                    <AiFeatureListItem 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6a2 2 0 100-4 2 2 0 000 4zm0 14a2 2 0 100-4 2 2 0 000 4zm6-8a2 2 0 100-4 2 2 0 000 4zm-12 0a2 2 0 100-4 2 2 0 000 4z" /></svg>}
                                        title="Diagnostic Assistance"
                                        description="Receive AI-generated suggestions for potential diagnoses based on shared case data and medical history."
                                    />
                                    <AiFeatureListItem 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                        title="Pattern Recognition"
                                        description="The system automatically flags anomalies and identifies trends across multiple cases, highlighting potential outbreaks or common complications."
                                    />
                                     <AiFeatureListItem 
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                                        title="Predictive Analysis"
                                        description="Leverage predictive models to forecast patient outcomes and treatment efficacy, enabling more proactive and personalized care."
                                    />
                                </ul>
                            </div>
                            <div>
                                <img src="https://images.unsplash.com/photo-1620912189837-e565b0e2a334?q=80&w=2670&auto=format&fit=crop" alt="AI analyzing medical scans" className="rounded-lg shadow-xl object-cover w-full h-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Hear From Our Innovators</h3>
                         <div className="relative max-w-2xl mx-auto">
                            <div className="overflow-hidden relative" style={{ height: '16rem' }}>
                                {testimonials.map((testimonial, index) => (
                                     <div 
                                        key={index}
                                        className="absolute w-full h-full transition-transform duration-500 ease-in-out"
                                        style={{ transform: `translateX(${(index - currentTestimonial) * 100}%)` }}
                                     >
                                        <TestimonialCard {...testimonial} />
                                    </div>
                                ))}
                            </div>
                            <button onClick={prevTestimonial} className="absolute top-1/2 -left-4 md:-left-16 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                             <button onClick={nextTestimonial} className="absolute top-1/2 -right-4 md:-right-16 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-teal-600 text-white">
                     <div className="container mx-auto px-4 py-20 text-center">
                        <h3 className="text-4xl font-bold mb-4">Ready to Transform Patient Care?</h3>
                        <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-8">Join a growing community of forward-thinking medical professionals today.</p>
                        <button onClick={() => openModal('signup')} className="px-8 py-3 bg-white text-teal-600 font-bold rounded-full hover:bg-gray-100 transition-transform hover:scale-105 text-lg">Sign Up For Free</button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto text-center text-gray-400">
                    <p className="mb-2">&copy; {new Date().getFullYear()} PulseLoopCare. All rights reserved.</p>
                    <button onClick={() => setShowPolicy(true)} className="hover:text-white underline transition-colors">Privacy Policy & Terms of Use</button>
                </div>
            </footer>
        </div>
    );
};


const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
        <div className="text-teal-500 mb-4 inline-block">{icon}</div>
        <h4 className="text-xl font-bold text-gray-800 mb-2">{title}</h4>
        <p className="text-gray-600">{description}</p>
    </div>
);

const HowItWorksStep: React.FC<{imageUrl: string, title: string, description: string, step: string}> = ({ imageUrl, title, description, step }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
        <div className="relative">
            <img src={imageUrl} alt={title} className="w-full h-56 object-cover" />
            <div className="absolute top-4 left-4 w-12 h-12 flex items-center justify-center bg-teal-500 text-white text-2xl font-bold rounded-full shadow-md">{step}</div>
        </div>
        <div className="p-6 text-left">
            <h4 className="text-xl font-bold text-gray-800 mb-2">{title}</h4>
            <p className="text-gray-600">{description}</p>
        </div>
    </div>
);


const TestimonialCard: React.FC<{quote: string, name: string, role: string, avatarUrl: string}> = ({ quote, name, role, avatarUrl }) => (
    <div className="bg-white h-full p-6 rounded-lg shadow-md flex flex-col justify-center">
        <p className="text-gray-600 italic mb-4 flex-grow">"{quote}"</p>
        <div className="flex items-center">
            <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover mr-4"/>
            <div>
                <p className="font-bold text-gray-800">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
            </div>
        </div>
    </div>
);

const AiFeatureListItem: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({ icon, title, description }) => (
    <li className="flex items-start group">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-teal-100 text-teal-600 rounded-full mr-4 transition-transform duration-300 group-hover:scale-110">
            {icon}
        </div>
        <div>
            <h4 className="text-lg font-bold text-gray-800">{title}</h4>
            <p className="text-gray-600">{description}</p>
        </div>
    </li>
);

export default LandingPage;