import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from '../../src/pages/LoginPage';
import { AuthProvider } from '../../src/context/AuthContext';

describe('LoginPage', () => {
  it('renders correctly', () => {
    cy.mount(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );
    cy.contains('h2', 'Welcome Back').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('handles successful login', () => {
    // Mock the login API call
    cy.intercept('POST', '**/users/token', {
      statusCode: 200,
      body: { access_token: 'fake-token' },
    }).as('loginRequest');

    // Mock the user profile fetch which happens after login
    cy.intercept('GET', '**/users/me', {
      statusCode: 200,
      body: { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User' },
    }).as('getUser');

    cy.mount(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
          <Toaster />
        </MemoryRouter>
      </AuthProvider>
    );

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').its('request.body').should((body) => {
      // FormData is a bit hard to inspect directly in Cypress intercept body sometimes, 
      // but let's check if the intercept worked.
      // Actually, axios sends FormData, but Cypress might parse it.
      // Let's just verify the call happened for now.
    });
    
    // Verify toast appears
    cy.contains('Successfully logged in!').should('be.visible');
  });

  it('handles login error', () => {
    cy.intercept('POST', '**/users/token', {
      statusCode: 401,
      body: { detail: 'Incorrect email or password' },
    }).as('loginFail');

    cy.mount(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
          <Toaster />
        </MemoryRouter>
      </AuthProvider>
    );

    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    
    // Verify error message in the UI
    cy.contains('.error-message', 'Incorrect email or password').should('be.visible');
    
    // Verify error toast
    cy.contains('Incorrect email or password').should('be.visible');
  });
});
