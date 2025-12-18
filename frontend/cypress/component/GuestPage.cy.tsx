import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GuestPage from '../../src/pages/GuestPage';

describe('GuestPage', () => {
  it('renders correctly', () => {
    cy.mount(
      <MemoryRouter>
        <GuestPage />
      </MemoryRouter>
    );

    // Check for logo text (alt text)
    cy.get('img[alt="TaskMaster Logo"]').should('be.visible');

    // Check for navigation buttons
    cy.contains('a', 'Login').should('have.attr', 'href', '/login');
    cy.contains('a', 'Register').should('have.attr', 'href', '/register');

    // Check for main heading
    cy.contains('h1', 'Manage your tasks with').should('be.visible');
    cy.contains('.highlight', 'Efficiency').should('be.visible');

    // Check for CTA button
    cy.contains('a', 'Get Started').should('have.attr', 'href', '/register');

    // Check for features
    cy.contains('Organize tasks').should('be.visible');
    cy.contains('Track progress').should('be.visible');
    cy.contains('Boost productivity').should('be.visible');
  });
});
