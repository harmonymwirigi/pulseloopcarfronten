import React, { useState } from 'react';
import { DisplayNamePreference, User } from '../types';

interface PrePostConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (preference: DisplayNamePreference) => void;
    user: User;
}

const formatName = (user: User, preference: DisplayNamePreference): string => {
    if (preference === DisplayNamePreference.Anonymous) {
        return 'Anonymous';
    }

    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    if (preference === DisplayNamePreference.FullName) {
        // e.g., "John D., RN, TX"
        const lastInitial = lastName ? ` ${lastName.charAt(0)}.` : '';
        const title = user.title ? `, ${user.title}` : '';
        const state = user.state ? `, ${user.state}` : '';
        return `${firstName}${lastInitial}${title}${state}`.replace(/ ,/g, ',');
    }

    if (preference === DisplayNamePreference.Initials) {
        // e.g., "J.D., RN, TX"
        const firstInitial = firstName ? `${firstName.charAt(0)}.` : '';
        const lastInitial = lastName ? `${lastName.charAt(0)}.` : '';
        const initials = (firstInitial + lastInitial).replace('..', '.');
        const title = user.title ? `, ${user.title}` : '';
        const state = user.state ? `, ${user.state}` : '';
        return `${initials}${title}${state}`.replace(/^,/, '').trim();
    }

    return user.name;
};

const PrePostConfirmationModal: React.FC<PrePostConfirmationModalProps> = ({ isOpen, onClose, onConfirm, user }) => {
    const [preference, setPreference] = useState<DisplayNamePreference>(DisplayNamePreference.FullName);
    const [phiConfirmed, setPhiConfirmed] = useState(false);

    if (!isOpen) return null;
    
    const handleConfirm = () => {
        if (phiConfirmed) {
            onConfirm(preference);
        }
    };

    const nameOptions = [
        {
            value: DisplayNamePreference.FullName,
            label: "First name, last initial, title, and state",
            example: formatName(user, DisplayNamePreference.FullName)
        },
        {
            value: DisplayNamePreference.Initials,
            label: "Initials, title, and state only",
            example: formatName(user, DisplayNamePreference.Initials)
        },
        {
            value: DisplayNamePreference.Anonymous,
            label: "Anonymous",
            example: formatName(user, DisplayNamePreference.Anonymous)
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
                <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mb-4">Posting Confirmation</h2>
                
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">How would you like your name displayed?</h3>
                        <fieldset className="space-y-2">
                             <legend className="sr-only">Display name preference</legend>
                            {nameOptions.map(option => (
                                <label key={option.value} className="flex items-start p-3 border rounded-md cursor-pointer has-[:checked]:border-teal-500 has-[:checked]:ring-2 has-[:checked]:ring-teal-500">
                                    <input
                                        type="radio"
                                        name="displayNamePreference"
                                        value={option.value}
                                        checked={preference === option.value}
                                        onChange={() => setPreference(option.value)}
                                        className="h-4 w-4 mt-1 text-teal-600 focus:ring-teal-500 border-gray-300"
                                    />
                                    <div className="ml-3 text-sm">
                                        <span className="font-medium text-gray-900">{option.label}</span>
                                        <p className="text-gray-500">(e.g., "{option.example}")</p>
                                    </div>
                                </label>
                            ))}
                        </fieldset>
                    </div>
                     <div className="flex items-start mt-4">
                        <div className="flex items-center h-5">
                            <input
                                id="phi_confirm"
                                name="phi_confirm"
                                type="checkbox"
                                checked={phiConfirmed}
                                onChange={(e) => setPhiConfirmed(e.target.checked)}
                                className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="phi_confirm" className="font-medium text-gray-700 cursor-pointer">I confirm I have removed patient identification information (PHI)</label>
                             <p className="text-gray-500">Ensure all patient identifiers, including names, dates, locations, and any other information that could identify individuals, have been removed.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleConfirm} 
                        disabled={!phiConfirmed} 
                        className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed font-semibold"
                    >
                        Confirm & Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrePostConfirmationModal;
