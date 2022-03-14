import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listing t /api/tickets for post request', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('It can onlt be access if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({}).expect(401);
  // expect(response.status).toEqual(401)
});

it('return a status other then 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('return an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 25,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      price: 25,
    })
    .expect(400);
});

it('return an error if invalid price provided', async () => {
  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'First Title',
      price: -25,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'First Title',
    })
    .expect(400);
});

it('create a ticket with valid params', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  let title = 'First Ticket';

  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: title,
      price: 25,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(25);
  expect(tickets[0].title).toEqual(title);
});

it('Publish an event', async () => {
  let title = 'First Ticket';

  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: title,
      price: 25,
    })
    .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled()
});
