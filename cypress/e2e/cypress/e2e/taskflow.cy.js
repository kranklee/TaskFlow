describe("TaskFlow Full E2E Test", () => {
  // Her testte farklı mail olsun ki "Kullanıcı zaten var" hatası almayalım.
  const randomId = Math.floor(Math.random() * 1000);
  const email = `cembesli${randomId}@gmail.com`;
  const password = "1234567";

  // Test başlamadan önce ekran boyutunu ayarla
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it("registers, logs in, manages a task and checks calendar/settings", () => {
    // 1) LOGIN PAGE AÇILSIN
    cy.visit("http://localhost:5000/index.html");

    cy.contains("Welcome to TaskFlow").should("be.visible");
    cy.contains("Create an account").should("be.visible");

    // 2) CREATE ACCOUNT SAYFASINA GİT
    cy.contains("Create an account").click();
    cy.url().should("include", "register");

    // --- HATA DÜZELTİLDİ ---
    // Alert pencerelerini otomatik onayla ama içine cy.log KOYMA.
    cy.on("window:alert", () => {
      return true; 
    });

    // 3) REGISTER FORMUNU DOLDUR
    cy.get("#registerFullName").should('be.visible').clear().type("Cem Besli");
    cy.get("#registerEmail").should('be.visible').clear().type(email);
    cy.get("#registerPassword").should('be.visible').clear().type(password);

    cy.contains("button", "Sign Up").click();

    // Kayıt sonrası Login'e dönme linkine tıkla
    cy.contains("Back to Login").click();
    cy.url().should("include", "index");

    // 4) LOGIN OL
    cy.get("#loginEmail").should('be.visible').clear().type(email);
    cy.get("#loginPassword").should('be.visible').clear().type(password);
    
    cy.contains("button", "Log In").click();

    // Dashboard'a yönlendirildiğini doğrula
    cy.url().should("include", "home-tasks");
    cy.contains("My Tasks").should("be.visible");

    // 5) YENİ TASK OLUŞTUR
    cy.contains("+ Add Task").click();
    cy.url().should("include", "add-task");

    const taskTitle = `Cypress Task ${randomId}`;
    const taskDescription = "Created by Cypress E2E automation";
    const taskDate = "2025-12-23";

    cy.get("#taskTitle").clear().type(taskTitle);
    cy.get("#taskDescription").clear().type(taskDescription);
    cy.get("#dueDate").clear().type(taskDate);
    cy.get("#priority").should('be.visible').select("High");

    // Task'ı kaydet
    cy.contains("Save Task").click();

    // Kaydettikten sonra listeye dönmeli
    // NOT: Eğer "Network Error" uyarısı yüzünden sayfa değişmezse burası fail olabilir.
    // Ancak 201 döndüğü için backend başarılı, muhtemelen frontend yönlendirmesi çalışacak.
    cy.url().should("include", "home-tasks");

    // Eklenen taskı listede bul
    cy.contains(taskTitle).should("be.visible");
    
    // Status kontrolü
    cy.contains(taskTitle)
      .parent()
      .contains("pending", { matchCase: false }); 

    // 6) DELAY (ERTELEME)
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });

    cy.contains(taskTitle)
      .parent()
      .contains("Delay")
      .click();

    cy.contains(taskTitle)
      .parent()
      .contains("delayed", { matchCase: false })
      .should("be.visible");

    // 7) EDIT (TITLE DEĞİŞTİR)
    const updatedTitle = `Cypress Task Updated ${randomId}`;

    cy.window().then((win) => {
      cy.stub(win, "prompt").returns(updatedTitle);
    });

    cy.contains(taskTitle)
      .parent()
      .contains("Edit")
      .click();

    cy.contains(updatedTitle).should("be.visible");

    // 8) CALENDAR KONTROLÜ
    cy.get("nav").contains("Calendar").click();
    cy.url().should("include", "calendar");
    cy.contains(updatedTitle).should("be.visible");

    // 9) SETTINGS (ŞİFRE DEĞİŞTİRME)
    cy.get("nav").contains("Settings").click();
    cy.url().should("include", "settings");

    cy.get("#currentPassword").clear().type(password);
    cy.get("#newPassword").clear().type(password);

    cy.contains("Update Password").click();

   
    cy.get("nav").contains("My Tasks").click();
    cy.url().should("include", "home-tasks");

    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });

    cy.contains(updatedTitle)
      .parent()
      .contains("Delete")
      .click();

    cy.contains(updatedTitle).should("not.exist");
  });
});