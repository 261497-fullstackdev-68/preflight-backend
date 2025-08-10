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
