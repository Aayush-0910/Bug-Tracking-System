'use client';

import { Navbar, Container } from 'react-bootstrap';

export default function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">
          Talentskout issue tracker
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}
