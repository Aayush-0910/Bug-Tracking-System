import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/mailer';

export async function GET(request, { params }) {
  const { id } = params;
  const bug = await prisma.bug.findUnique({
    where: { id: parseInt(id, 10) },
    include: { developer: true },
  });
  if (!bug) {
    return NextResponse.json({ error: 'Bug not found' }, { status: 404 });
  }
  return NextResponse.json(bug);
}

export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();
  const { title, description, status, priority, developerId, dueDate } = data;

  // 1. Get the original bug
  const originalBug = await prisma.bug.findUnique({
    where: { id: parseInt(id, 10) },
    include: { developer: true },
  });

  if (!originalBug) {
    return NextResponse.json({ error: 'Bug not found' }, { status: 404 });
  }

  // 2. Update the bug
  const updatedBug = await prisma.bug.update({
    where: { id: parseInt(id, 10) },
    data: {
      title,
      description,
      status,
      priority,
      developerId: developerId ? parseInt(developerId, 10) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { developer: true },
  });

  // 3. Check for changes and send notifications
  const newDeveloperId = developerId ? parseInt(developerId, 10) : null;

  // Notify new assignee
  if (newDeveloperId && newDeveloperId !== originalBug.developerId) {
    if (updatedBug.developer) {
      await sendNotification({
        to: updatedBug.developer.email,
        subject: `New Bug Assigned: "${updatedBug.title}"`,
        text: `You have been assigned a new bug.\n\nTitle: ${updatedBug.title}\nDescription: ${updatedBug.description}\nPriority: ${updatedBug.priority}`,
        html: `<p>You have been assigned a new bug.</p><h3>${updatedBug.title}</h3><p>${updatedBug.description}</p><p><b>Priority:</b> ${updatedBug.priority}</p>`,
      });
    }
  }
  // Notify about status change
  else if (status && status !== originalBug.status) {
    if (updatedBug.developer) {
       await sendNotification({
        to: updatedBug.developer.email,
        subject: `Bug Status Updated: "${updatedBug.title}"`,
        text: `The status of the bug "${updatedBug.title}" has been updated to ${status}.`,
        html: `<p>The status of the bug "${updatedBug.title}" has been updated to <b>${status}</b>.</p>`,
      });
    }
  }

  return NextResponse.json(updatedBug);
}
export async function DELETE(request, { params }) {
  const { id } = params;
  await prisma.bug.delete({
    where: { id: parseInt(id, 10) },
  });
  return new Response(null, { status: 204 });
}