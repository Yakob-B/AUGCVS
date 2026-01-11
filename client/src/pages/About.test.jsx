import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './About';
import { BrowserRouter } from 'react-router-dom';

describe('About Page', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <About />
            </BrowserRouter>
        );
        // Debug: log the DOM to see what's rendered if this fails
        // screen.debug(); 
    });

    it('contains the main title', () => {
        render(
            <BrowserRouter>
                <About />
            </BrowserRouter>
        );
        // Looking for a key text that we know exists on the About page.
        // Adjust the text based on actual content if needing strict match.
        // Using regex /i for case insensitivity.
        const titleElement = screen.getByText(/Ambo University Graduate/i);
        expect(titleElement).toBeInTheDocument();
    });
});
