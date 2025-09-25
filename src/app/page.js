'use client';

import { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, ButtonGroup, Tabs, Tab } from 'react-bootstrap';

// Reusable Bug Table Component
const BugTable = ({ bugs, handleShowEditModal, handleMarkAsClosed, handleDelete }) => (
  <Table striped bordered hover responsive>
    <thead>
      <tr>
        <th>#</th>
        <th>Title</th>
        <th>Status</th>
        <th>Priority</th>
        <th>Assigned To</th>
        <th>Due Date</th>
        <th>Created At</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {bugs.map((bug) => (
        <tr key={bug.id}>
          <td>{bug.id}</td>
          <td>{bug.title}</td>
          <td><span className={`badge bg-${bug.status === 'OPEN' ? 'danger' : bug.status === 'CLOSED' ? 'success' : 'warning'}`}>{bug.status}</span></td>
          <td>{bug.priority}</td>
          <td>{bug.developer ? bug.developer.name : 'Unassigned'}</td>
          <td>{bug.dueDate ? new Date(bug.dueDate).toLocaleDateString() : 'N/A'}</td>
          <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
          <td>
            <ButtonGroup size="sm">
              <Button variant="outline-primary" onClick={() => handleShowEditModal(bug)}>Edit</Button>
              {bug.status !== 'CLOSED' && (
                <Button variant="outline-success" onClick={() => handleMarkAsClosed(bug)}>Close</Button>
              )}
              <Button variant="outline-danger" onClick={() => handleDelete(bug.id)}>Delete</Button>
            </ButtonGroup>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default function HomePage() {
  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    developerId: '',
    dueDate: '',
  });
  const [newDeveloper, setNewDeveloper] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [key, setKey] = useState('all');

  const fetchBugs = async () => {
    try {
      const res = await fetch('/api/bugs');
      if (!res.ok) throw new Error('Failed to fetch bugs');
      const data = await res.json();
      setBugs(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await fetch('/api/developers');
      if (!res.ok) throw new Error('Failed to fetch developers');
      const data = await res.json();
      setDevelopers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchBugs(), fetchDevelopers()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCloseBugModal = () => setShowBugModal(false);
  const handleShowBugModal = () => setShowBugModal(true);
  const handleCloseDeveloperModal = () => setShowDeveloperModal(false);
  const handleShowDeveloperModal = () => setShowDeveloperModal(true);

  const handleShowEditModal = (bug) => {
    setEditingBug({
      ...bug,
      dueDate: bug.dueDate ? new Date(bug.dueDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingBug(null);
  };

  const handleBugInputChange = (e) => {
    const { name, value } = e.target;
    setNewBug((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBug((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeveloperInputChange = (e) => {
    const { name, value } = e.target;
    setNewDeveloper((prev) => ({ ...prev, [name]: value }));
  };

  const handleErrorResponse = async (res) => {
    if (res.headers.get('content-type')?.includes('application/json')) {
      const errData = await res.json();
      return errData.error || 'An unknown error occurred.';
    } else {
      const textData = await res.text();
      return `Server error: ${textData}`;
    }
  }

  const handleBugFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBug),
      });
      if (!res.ok) {
        const errorMessage = await handleErrorResponse(res);
        throw new Error(errorMessage);
      }
      await fetchBugs();
      handleCloseBugModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingBug) return;
    setError(null);
    try {
      const res = await fetch(`/api/bugs/${editingBug.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingBug),
        }
      );
      if (!res.ok) {
        const errorMessage = await handleErrorResponse(res);
        throw new Error(errorMessage);
      }
      await fetchBugs();
      handleCloseEditModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeveloperFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/developers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeveloper),
      });
      if (!res.ok) {
        const errorMessage = await handleErrorResponse(res);
        throw new Error(errorMessage);
      }
      await fetchDevelopers();
      setNewDeveloper({ name: '', email: '' });
      handleCloseDeveloperModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      setError(null);
      try {
        const res = await fetch(`/api/bugs/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorMessage = await handleErrorResponse(res);
          throw new Error(errorMessage);
        }
        await fetchBugs();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleMarkAsClosed = async (bug) => {
    setError(null);
    try {
      const res = await fetch(`/api/bugs/${bug.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bug, status: 'CLOSED' }),
        }
      );
      if (!res.ok) {
        const errorMessage = await handleErrorResponse(res);
        throw new Error(errorMessage);
      }
      await fetchBugs();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredBugs = (status) => {
    if (status === 'all') return bugs;
    return bugs.filter(bug => bug.status === status);
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Bug Tracker</h1>
        <ButtonGroup>
          <Button variant="primary" onClick={handleShowBugModal}>
            New Bug
          </Button>
          <Button variant="info" onClick={handleShowDeveloperModal}>
            New Developer
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/api/bugs/export/csv')}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/api/bugs/export/pdf')}>
            Export PDF
          </Button>
        </ButtonGroup>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Tabs id="bug-status-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab eventKey="all" title="All">
            <BugTable bugs={filteredBugs('all')} handleShowEditModal={handleShowEditModal} handleDelete={handleDelete} handleMarkAsClosed={handleMarkAsClosed} />
          </Tab>
          <Tab eventKey="OPEN" title="Open">
            <BugTable bugs={filteredBugs('OPEN')} handleShowEditModal={handleShowEditModal} handleDelete={handleDelete} handleMarkAsClosed={handleMarkAsClosed} />
          </Tab>
          <Tab eventKey="IN_PROGRESS" title="In Progress">
            <BugTable bugs={filteredBugs('IN_PROGRESS')} handleShowEditModal={handleShowEditModal} handleDelete={handleDelete} handleMarkAsClosed={handleMarkAsClosed} />
          </Tab>
          <Tab eventKey="CLOSED" title="Closed">
            <BugTable bugs={filteredBugs('CLOSED')} handleShowEditModal={handleShowEditModal} handleDelete={handleDelete} handleMarkAsClosed={handleMarkAsClosed} />
          </Tab>
        </Tabs>
      )}

      {/* New Bug Modal */}
      <Modal show={showBugModal} onHide={handleCloseBugModal}>
        <Modal.Header closeButton><Modal.Title>Create New Bug</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBugFormSubmit}>
            <Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Control type="text" name="title" value={newBug.title} onChange={handleBugInputChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} name="description" value={newBug.description} onChange={handleBugInputChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Due Date</Form.Label><Form.Control type="date" name="dueDate" value={newBug.dueDate} onChange={handleBugInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Priority</Form.Label><Form.Select name="priority" value={newBug.priority} onChange={handleBugInputChange}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Assign to Developer</Form.Label><Form.Select name="developerId" value={newBug.developerId} onChange={handleBugInputChange}><option value="">Unassigned</option>{developers.map((dev) => (<option key={dev.id} value={dev.id}>{dev.name}</option>))}</Form.Select></Form.Group>
            <Button variant="primary" type="submit">Create Bug</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Bug Modal */}
      {editingBug && (
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton><Modal.Title>Edit Bug #{editingBug.id}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditFormSubmit}>
              <Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Control type="text" name="title" value={editingBug.title} onChange={handleEditInputChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} name="description" value={editingBug.description} onChange={handleEditInputChange} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Due Date</Form.Label><Form.Control type="date" name="dueDate" value={editingBug.dueDate} onChange={handleEditInputChange} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select name="status" value={editingBug.status} onChange={handleEditInputChange}><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="CLOSED">Closed</option></Form.Select></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Priority</Form.Label><Form.Select name="priority" value={editingBug.priority} onChange={handleEditInputChange}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Form.Select></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Assign to Developer</Form.Label><Form.Select name="developerId" value={editingBug.developerId || ''} onChange={handleEditInputChange}><option value="">Unassigned</option>{developers.map((dev) => (<option key={dev.id} value={dev.id}>{dev.name}</option>))}</Form.Select></Form.Group>
              <Button variant="primary" type="submit">Save Changes</Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* New Developer Modal */}
      <Modal show={showDeveloperModal} onHide={handleCloseDeveloperModal}>
        <Modal.Header closeButton><Modal.Title>Create New Developer</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDeveloperFormSubmit}>
            <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={newDeveloper.name} onChange={handleDeveloperInputChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={newDeveloper.email} onChange={handleDeveloperInputChange} required /></Form.Group>
            <Button variant="primary" type="submit">Create Developer</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
