/// <reference types="cypress" />

describe('Auth API', () => {

  const baseUrl = 'http://localhost:3000'; // เปลี่ยนถ้าพอร์ตไม่ใช่ 3000
  const username = 'testuser_' + Date.now(); // กัน username ซ้ำ
  const password = '123456';

  it('สมัครสมาชิกสำเร็จ', () => {
    cy.request('POST', `${baseUrl}/signup`, {
      username,
      password,
      confirmPassword: password
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.eq('สมัครสมาชิกสำเร็จ');
    });
  });

  it('สมัครสมาชิกซ้ำควร error', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/signup`,
      failOnStatusCode: false, // ปิด auto fail เพราะเราคาดหวัง error
      body: {
        username,
        password,
        confirmPassword: password
      }
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Username นี้ถูกใช้แล้ว');
    });
  });

  it('รหัสผ่านไม่ตรงกันควร error', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/signup`,
      failOnStatusCode: false,
      body: {
        username: 'newuser_' + Date.now(),
        password,
        confirmPassword: '654321'
      }
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('รหัสผ่านไม่ตรงกัน');
    });
  });

  it('ล็อกอินสำเร็จ', () => {
    cy.request('POST', `${baseUrl}/login`, {
      username,
      password
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.eq('เข้าสู่ระบบสำเร็จ');
      expect(res.body).to.have.property('userId');
    });
  });

  it('ล็อกอินผิดรหัสผ่านควร error', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/login`,
      failOnStatusCode: false,
      body: {
        username,
        password: 'wrongpass'
      }
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('รหัสผ่านไม่ถูกต้อง');
    });
  });

  it('ล็อกอิน user ไม่เจอควร error', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/login`,
      failOnStatusCode: false,
      body: {
        username: 'nouser_' + Date.now(),
        password
      }
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('ไม่มีผู้ใช้นี้');
    });
  });

});

describe('Auth pages', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  context('Login Page', () => {
    // it('แสดง error ถ้า username หรือ password ว่าง', () => {
    //   cy.get('button[type="submit"]').click()

    //   cy.get('[data-cy=login-error]', { timeout: 5000 }) // รอได้ถึง 5 วิ
    //     .should('contain.text', 'Enter your username and password')
    // })

    // it('ล็อกอินสำเร็จด้วยข้อมูลที่ถูกต้อง', () => {
    //   cy.intercept('POST', '/api/login', {
    //     statusCode: 200,
    //     body: { message: 'เข้าสู่ระบบสำเร็จ' },
    //   }).as('loginRequest')

    //   cy.get('input[type="text"]').type('testuser')
    //   cy.get('input[type="password"]').type('123456')
    //   cy.get('button[type="submit"]').click()

    //   cy.wait('@loginRequest')
    //   cy.contains('เข้าสู่ระบบสำเร็จ').should('be.visible')
    // })

    it('แสดง error เมื่อล็อกอินไม่สำเร็จ', () => {
      cy.intercept('POST', '/api/login', {
        statusCode: 401,
        body: { error: 'Incorrect username or password' },
      }).as('loginRequestFail')

      cy.get('input[type="text"]').type('wronguser')
      cy.get('input[type="password"]').type('wrongpass')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginRequestFail')
      cy.contains('Incorrect username or password').should('be.visible')
    })

    it('สามารถเปิดหน้า Sign Up ได้', () => {
      cy.contains('Sign up').click()
      // ถ้าไม่มี routing URL change ให้ตรวจสอบ element แทน
      cy.contains('Sign Up').should('be.visible')
    })
  })

  context('Sign Up Page', () => {
    beforeEach(() => {
      cy.contains('Sign up').click()
    })

    // it('แสดง error ถ้ากรอกไม่ครบ', () => {
    //   cy.get('button[type="submit"]').click()
    //   cy.contains('Please fill in all required fields').should('be.visible')
    // })

    it('แสดง error ถ้า password กับ confirm password ไม่ตรงกัน', () => {
      cy.get('input[type="text"]').type('newuser')
      cy.get('input[type="password"]').first().type('123456')
      cy.get('input[type="password"]').last().type('654321')
      cy.get('button[type="submit"]').click()
      cy.contains('Passwords do not match.').should('be.visible')
    })

    // it('สมัครสมาชิกสำเร็จ', () => {
    //   cy.intercept('POST', '/api/signup', {
    //     statusCode: 200,
    //     body: { message: 'Registration successful!' },
    //   }).as('signupRequest')

    //   cy.get('input[type="text"]').type('newuser')
    //   cy.get('input[type="password"]').first().type('123456')
    //   cy.get('input[type="password"]').last().type('123456')
    //   cy.get('button[type="submit"]').click()

    //   cy.wait('@signupRequest')
    //   cy.contains('Registration successful!').should('be.visible')
    // })

    it('แสดง error เมื่อ username ซ้ำ', () => {
      cy.intercept('POST', '/api/signup', {
        statusCode: 409,
        body: { error: 'Username already exists.' },
      }).as('signupRequestFail')

      cy.get('input[type="text"]').type('existinguser')
      cy.get('input[type="password"]').first().type('123456')
      cy.get('input[type="password"]').last().type('123456')
      cy.get('button[type="submit"]').click()

      cy.wait('@signupRequestFail')
      cy.contains('Username already exists.').should('be.visible')
    })
  })
})
