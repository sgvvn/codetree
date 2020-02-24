/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from './util'
const MilestonePage = new (require('../pages/MilestonePage'))();

describe('Codetree : Changing, Updateing And Deleting Milestones functionality Tests', () => {
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
        clickOn('//span[contains(text(),"Milestones")]')
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones')
        cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyMilestoneView');
        cy.get('table[data-container="milestones"]').first().as('openMilestones')
        cy.get('table[data-container="milestones"]').last().as('closeMilestones')
        cy.route('POST', '/projects/*/issues').as('createIssue');
        cy.route('GET', '/projects/*/cards/*?filter={}').as('verifyCreateIssue');
        cy.route("GET", '/projects/*/cards/*?filter={"type":"epic"}').as('verifyEpic');
        cy.route('GET','projects/*/views?type=epic&include_counts=true&scope=issues&view_type=boards').as('addEpics');
        cy.route('GET','/projects/*/issues/*/edit').as('editIssue');
        cy.route('POST','/projects/*/issues/*').as('moveIssueDone');
    })

    context('At Open Milestone Window', () => {

        it('verify created milestone have hamburger, setting, progress bar, due date and View Task Board CHGMIL_001', () => {
            MilestonePage.createMilestone(random);
            cy.get('th.group-header').should(($th) => {
                expect($th.first().text(), 'Hearder : Open Milestones').to.contains('Open Milestones');
                expect($th.last().text(), 'Hearder : Closed Milestones').to.contains('Closed Milestones');
            });
            cy.get('tr[data-item="milestone"]').within(() => {
                cy.get('td.col-handle').should('be.visible');
                cy.get('td.col-settings').should('be.visible');
                cy.get('td.col-due-on').should('be.visible');
                cy.get('div.progress-bar').should('be.visible');
                cy.get('td.col-controls').should('contain', 'View Task Board');
            });
        })

        it('verify created milestone move to top functionality CHGMIL_002 CHGMIL_003', () => {
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.first().click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').first().should('contain', random);
            })
        })

        it('verify created milestone move to bottom functionality CHGMIL_002 CHGMIL_004', () => {
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.eq(1).click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').last().should('contain', random);
            })
        })

        it('verify new created milestone not assinged to any issue in both List and Board view CHGMIL_007', () => {
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().siblings('td.col-controls').click();
            })
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
            cy.get('.board-card-details').should('have.length', '0');
            clickOn('a#filter-format');
            clickOn('input[value="list"]');
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/issues')
            cy.get('tr[data-item="issue"]').should('have.length', '0');
        })

        it('verify created milestone add in create issue functionality', () => {
            cy.contains('Add Issue').click();
            cy.wait(400);
            cy.get('#title').type("Test Issue " + random);
            clickOnElement('a.issue-form-milestone-menu-toggle .octicon', "last");
            cy.get('.issue-form-milestone-menu .dropdown-menu .menu-item-filter .text-field').last().type(random);
            cy.get('.issue-form-milestone-menu .dropdown-menu ul li').contains(random).click();
            cy.get('a.issue-form-milestone-menu-toggle .title').should('contain', random);
            cy.contains('Create Issue').click();
            cy.wait('@createIssue');
            clickOn('button.issue-form-command');
            clickOn('//a/span[contains(text(),"Issues")]');
            cy.get('div[data-id="backlog"] ul.issue-labels li').first().should('contain', random);
        })

        it('verify created milestone 100% completed after change stage by Done of created issue', () => {
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).click();
            })
            cy.get('div[data-id="backlog"] .board-card-details h3').contains(random).click();
            cy.wait('@editIssue');
            cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
            cy.get('input#stage_done').last().click();
            cy.wait('@moveIssueDone');
            clickOn('//span[contains(text(),"Milestones")]')
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().siblings('td.col-progress-summary').should('contain','100% complete');
            })
        })

        it('verify created lable add in create epic functionality CRLB_011', () => {
            clickOn('//span[contains(text(),"Epics")]');
            cy.wait('@addEpics');
            clickOn('button.add-issue-carat');
            clickOn('a[data-component="new-epic-controls"]');
            cy.wait(300);
            setTextOn('input.new-title-field', "Test Epic " + random);
            clickOnElement('a.issue-form-milestone-menu-toggle .octicon', "last");
            cy.get('.issue-form-milestone-menu .dropdown-menu .menu-item-filter .text-field').last().type(random);
            cy.get('.issue-form-milestone-menu .dropdown-menu ul li').contains(random).click();
            cy.get('a.issue-form-milestone-menu-toggle .title').should('contain', random);
            clickOn('button[data-behavior="create-issue"]');
            clickOn('button.issue-form-command');
            cy.get('div[data-id="backlog"] ul.issue-labels li').first().should('contain', random);
          })

          it('verify created milestone 100% completed after change stage by Done of created epic', () => {
            clickOn('//span[contains(text(),"Epics")]');
            cy.get('div[data-id="backlog"] .board-card-details h3').contains(random).click();
            cy.wait('@editIssue');
            cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
            cy.get('input#stage_done').last().click();
            cy.wait('@moveIssueDone');
            clickOn('//span[contains(text(),"Milestones")]')
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().siblings('td.col-progress-summary').should('contain','100% complete');
            })
        })

        it('verify created milestone close and reopen again functionality CHGMIL_008 CHGMIL_010', () => {
            MilestonePage.closeMilestone(random);
            MilestonePage.reopenMilestone(random);
        })

        it('verify created milestone edit title successfully CHGMIL_008 CHGMIL_011', () => {
            MilestonePage.editMilestone(random, 'openMilestone');
        })

        it('verify created milestone delete successfully CHGMIL_008 CHGMIL_009', () => {
            MilestonePage.deleteMilestone(random, 'openMilestone');
        })
    })

    context('At Close Milestone Window', () => {

        it('verify closed milestone have hamburger, setting, progress bar, due date and View Task Board CHGMIL_001', () => {
            MilestonePage.createMilestone(random);
            MilestonePage.closeMilestone(random);
            cy.get('th.group-header').should(($th) => {
                expect($th.first().text(), 'Hearder : Open Milestones').to.contains('Open Milestones');
                expect($th.last().text(), 'Hearder : Closed Milestones').to.contains('Closed Milestones');
            });
            cy.get('tr[data-item="milestone"]').within(() => {
                cy.get('td.col-handle').should('be.visible');
                cy.get('td.col-due-on').should('be.visible');
                cy.get('div.progress-bar').should('be.visible');
                cy.get('td.col-controls').should('contain', 'View Task Board');
                cy.get('td.col-settings').should('be.visible');
            });
        })

        it('verify closed milestone move to bottom functionality', () => {
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.eq(1).click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').last().should('contain', random);
            })
        })

        it('verify closed milestone move to top functionality', () => {
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().prev('td.col-handle').click();
                cy.xpath('//span[@aria-expanded="true"]//following::div[@class="dropdown-menu sort-dropdown"]/ul/li/a').should(($ele) => {
                    expect($ele.first().text(), 'Option : Move to top').to.contains('Move to top');
                    expect($ele.last().text(), 'Option : Move to bottom').to.contains('Move to bottom');
                    $ele.first().click();
                })
                cy.wait('@verifyMilestoneView')
            })
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').first().should('contain', random);
            })
        })

        it('verify new closed milestone not assinged to any issue in both List and Board view CHGMIL_007', () => {
            cy.get('@closeMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().siblings('td.col-controls').click();
            })
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
            cy.get('.board-card-details').should('have.length', '0');
            clickOn('a#filter-format');
            clickOn('input[value="list"]');
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/issues')
            cy.get('tr[data-item="issue"]').should('have.length', '0');
        })

        it('verify closed milestone reopen and close again functionality', () => {
            MilestonePage.reopenMilestone(random);
            MilestonePage.closeMilestone(random);
        })

        it('verify closed milestone edit title successfully', () => {
            MilestonePage.editMilestone(random, 'closedMileStone');
        })

        it('verify closed milestone delete successfully', () => {
            MilestonePage.deleteMilestone(random, 'closedMileStone');
        })
    })
})