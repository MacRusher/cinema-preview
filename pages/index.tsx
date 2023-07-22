import {
  Chip,
  Container,
  createStyles,
  Group,
  Header,
  Select,
  SelectItem,
  Title,
  Card,
  Badge,
  Stack,
  Button,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

type MovieData = {
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
};

// TODO: only cinema supported for now
const cinemas = [{ value: '1097', label: 'Wrocław - Wroclavia' }];

const attributeValues: Record<string, string> = {
  '2d': '2D',
  '3d': '3D',
  imax: 'IMAX',
  'dolby-atmos': 'Dolby Atmos',
  subbed: 'Napisy',
  // 'first-subbed-lang-pl': 'Napisy PL',
  dubbed: 'Dubbing',
  // 'dubbed-lang-pl': 'Dubbing PL',
  vip: 'VIP',
};

const useStyles = createStyles(() => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
}));

export default function Home() {
  const { classes } = useStyles();
  const [cinema, setCinema] = useState<string | null>('1097');
  const [date, setDate] = useState<Date | null>(() => new Date());
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [movieList, setMovieList] = useState<SelectItem[]>([]);
  const [movieId, setMovieId] = useState<string>('');
  const [attributes, setAttributes] = useState(['subbed']);

  useEffect(() => {
    console.log('effect', cinema, date);
    fetch('/api/getMovies')
      .then(res => res.json())
      .then((data: MovieData[]) => {
        console.log('data', data);
        setMovieData(data);
        setMovieList(
          data.map(movie => ({
            value: movie.id,
            label: movie.name,
          })),
        );
      });
  }, [cinema, date]);

  const setMovie = useCallback((movieId: string) => {
    console.log('setMovie', movieId);
    setMovieId(movieId);
  }, []);

  const movie = movieData.find(movie => movie.id === movieId);

  const events = movie?.events.filter(event =>
    attributes.every(attr => event.attributes.includes(attr)),
  );

  return (
    <Container>
      <Header height={50} mb={10}>
        <Container className={classes.header}>
          <Title order={3}>Cinema Seat Preview</Title>
        </Container>
      </Header>

      <Group position="center" sx={{ padding: 15 }}>
        <Select
          value={cinema}
          onChange={setCinema}
          data={cinemas}
          label="Wybierz kino"
        />

        <DateInput value={date} onChange={setDate} label="Wybierz dzień" />

        <Select
          value={movieId}
          onChange={setMovie}
          data={movieList}
          label="Wybierz film"
          searchable
        />
      </Group>

      <Chip.Group multiple value={attributes} onChange={setAttributes}>
        <Group position="center" sx={{ padding: 15 }}>
          {Object.keys(attributeValues).map(key => (
            <Chip key={key} value={key}>
              {attributeValues[key]}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      {/* <pre>{JSON.stringify(events, null, 2)}</pre> */}

      <Stack justify="flex-start">
        {events?.map(event => (
          <Card key={event.id} shadow="sm" padding="xs" radius="md" withBorder>
            <Group position="left">
              <Title order={5}>{dayjs(event.dateTime).format('hh:mm')}</Title>
              {event.attributes
                .filter(attr => !!attributeValues[attr])
                .map(attr => (
                  <Badge key={attr} variant="light" color="yellow">
                    {attributeValues[attr]}
                  </Badge>
                ))}
            </Group>

            <Button variant="light" color="blue" mt="md" radius="md">
              Sprawdź miejsca
            </Button>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
