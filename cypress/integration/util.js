function findElement(elementPath) {
    let element = '';
    if (elementPath.includes('//')) {
        element = cy.xpath(elementPath);
    }
    else {
        element = cy.get(elementPath);
    }
    return element;
}

module.exports = {
    sidestep_login: function(userId){
      cy.visit('/signin?id=' + userId + '&key=' + Cypress.env('TOKEN_ENCRYPTION_KEY'));
    },
    login: function (username, password){
        cy.clearCookies({ domain: null });
        cy.visit('/signup');
        cy.get('#login_field').type(username);
        cy.get('input[type="password"]').type(password)
        cy.get('input[type="submit"]').click();
    },
    randomString: function(string_length) {
        let random_string = '';
        let random_ascii;
        for (let i = 0; i < string_length; i++) {
            random_ascii = Math.floor((Math.random() * 25) + 97);
            random_string += String.fromCharCode(random_ascii)
        }
        return random_string
    },
    clickOn: function(elementPath) {
        let element = findElement(elementPath);
        element.click({ force: true });
    },
    clickOnElement: function(elementPath, elementType) {
        let element = findElement(elementPath);
        if (elementType.includes('first')) {
            element.first().click({ force: true });
        }
        else if (elementType.includes('last')) {
            element.last().click({ force: true });
        }
    },
    setTextOn: function(elementPath, sText) {
        let element = findElement(elementPath);
        element.type(sText);
    },
    clear: function(elementPath) {
        let element = findElement(elementPath);
        element.clear();
    },
    doubleClickOn: function(elementPath) {
        let element = findElement(elementPath);
        element.dblclick({ force: true });
    },
    rightClickOn: function(elementPath) {
        let element = findElement(elementPath);
        element.rightclick({ force: true });
    }
}
