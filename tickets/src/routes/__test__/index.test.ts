import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';


const createTicket = () => {
  const title = 'Second Ticket';
  const price = 50;
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title,
    price,
  });
};

it('Can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
  .get('/api/tickets')
  .set('Cookie', global.signin())
  .send()
  .expect(200)

  expect(response.body.length).toEqual(4)
});

it('returns the ticket if the ticket is found', async () => {
  const title = 'Second Ticket';
  const price = 50;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
