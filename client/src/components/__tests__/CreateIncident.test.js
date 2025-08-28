import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateIncident from '../CreateIncident';

// Simple mocks
jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{component}</BrowserRouter>);
};

describe('CreateIncident Component', () => {
  test('renders create incident form', () => {
    renderWithRouter(<CreateIncident />);
    
    // Check basic form elements
    expect(screen.getByText('Create New Incident')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Incident Type *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Incident' })).toBeInTheDocument();
  });

  test('has incident type dropdown with correct options', () => {
    renderWithRouter(<CreateIncident />);
    
    const select = screen.getByLabelText('Incident Type *');
    expect(select).toBeInTheDocument();
    
    // Check dropdown options
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(4); // Default + 3 types
    expect(options[1].value).toBe('Fire');
    expect(options[2].value).toBe('Smoke');
    expect(options[3].value).toBe('Emergency');
  });
});
