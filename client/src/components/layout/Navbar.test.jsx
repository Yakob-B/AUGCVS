import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Import Context to provider
import { ThemeContext } from '../../contexts/ThemeContext';

// Mock contexts
const MockAuthProvider = ({ children, value }) => (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);

const MockThemeProvider = ({ children, value }) => (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
);

const renderNavbar = (authValue, themeValue = { isDark: false, toggleTheme: vi.fn() }) => {
    return render(
        <BrowserRouter>
            <MockAuthProvider value={authValue}>
                <MockThemeProvider value={themeValue}>
                    <Navbar />
                </MockThemeProvider>
            </MockAuthProvider>
        </BrowserRouter>
    );
};

describe('Navbar Component', () => {
    it('renders Login and Register links when not authenticated', () => {
        const authValue = {
            isAuthenticated: false,
            user: null,
            logout: vi.fn()
        };

        renderNavbar(authValue);

        expect(screen.getByText(/Login/i)).toBeInTheDocument();
        expect(screen.getByText(/Register/i)).toBeInTheDocument();
        expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
    });

    it('renders Dashboard and Logout when authenticated', () => {
        const authValue = {
            isAuthenticated: true,
            user: { firstName: 'John', lastName: 'Doe', role: 'graduate' },
            logout: vi.fn()
        };

        renderNavbar(authValue);

        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    });

    it('renders Admin specific links when user is admin', () => {
        const authValue = {
            isAuthenticated: true,
            user: { firstName: 'Admin', lastName: 'User', role: 'admin' },
            logout: vi.fn()
        };

        renderNavbar(authValue);

        expect(screen.getByText(/Users/i)).toBeInTheDocument(); // Admin only link
    });
});
