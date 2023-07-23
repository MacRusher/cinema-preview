import dayjs from 'dayjs';
import type { NextApiRequest, NextApiResponse } from 'next';

type CCResponse = {
  films: {
    id: string;
    name: string;
    posterLink: string;
  }[];
  events: {
    id: string;
    filmId: string;
    eventDateTime: string;
    attributeIds: string[];
    bookingLink: string;
    auditorium: string;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | {
        id: string;
        name: string;
        poster: string;
        events: {
          id: string;
          attributes: string[];
          auditorium: string;
          dateTime: string;
          link: string;
        }[];
      }[]
    | { message: string }
  >,
) {
  try {
    const {
      cinema = '1097',
      date = new Date().toISOString(),
    }: {
      cinema?: string;
      date?: string;
    } = JSON.parse(req.body as string);
    console.log('req', { cinema, date });

    const data = await fetch(
      `https://www.cinema-city.pl/pl/data-api-service/v1/quickbook/10103/film-events/in-cinema/${cinema}/at-date/${dayjs(
        date,
      ).format('YYYY-MM-DD')}?attr=&lang=pl_PL`,
    ).then(res => res.json());

    const { films = [], events = [] } = data.body as CCResponse;

    const movies = films.map(({ id, name, posterLink }) => ({
      id,
      name,
      poster: posterLink,
      events: events
        .filter(event => event.filmId === id && event.eventDateTime)
        .map(event => ({
          id: event.id,
          attributes: event.attributeIds,
          auditorium: event.auditorium,
          dateTime: event.eventDateTime,
          link: event.bookingLink,
        }))
        .sort((a, b) => (a.dateTime > b.dateTime ? 1 : -1)),
    }));

    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
}
