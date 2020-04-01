/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from './util'


describe('Codetree : Create Project Functionality Tests', () => {
    var random = randomString(4);
    var user;
    before(function () {
        cy.fixture('users.json').as('usersData');
        cy.get('@usersData').then((users) => {
            user = users.grp1Collaborator;
        })
    })

    beforeEach(function () {
        cy.server();
        sidestep_login(user.publicId);
        cy.get('.sidebar').should('be.visible');
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.get('.navbar-go-button').click()
        cy.xpath('//a[@href="/projects/new"]').click();
        cy.location('pathname').should('include','/projects/new');
        cy.get('[name="button"]').as('createProject')
    })

    it('verify fields at create project page CP_001', () => {
        cy.get('[name="name"]').should('have.attr', 'placeholder', 'My Awesome App')
       
    })

    it('verify project name field Validation CP_002', () => {
        cy.get('#multiselect0_avListContent div').first().click()
        cy.get('@createProject').click()
        cy.get('[data-errors-for="name"]').should('contain','Name is required')
        cy.get('.general-error-message').should('contain','Please fix the above errors and try again')
    })

    it('verify choose at least one repository section validation CP_003', () => {
        cy.get('[name="name"]').type(random);
        cy.get('@createProject').click()
        cy.get('[data-errors-for="repositories"]').should('contain','Select at least one repository')
        cy.get('.general-error-message').should('contain','Please fix the above errors and try again')
    })

})