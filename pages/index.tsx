import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Chip,
  Container,
  createStyles,
  Group,
  Header,
  Image,
  Loader,
  Select,
  SelectItem,
  Stack,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useSetState } from '@mantine/hooks';
import { IconMoodSad, IconTicket } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

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
  const [movieId, setMovieId] = useState<string | null>('');
  const [attributes, setAttributes] = useState(['subbed']);
  const [previews, setPreviews] = useSetState<
    Record<string, { preview?: string; loading: boolean }>
  >({});

  useEffect(() => {
    fetch('/api/getMovies', {
      method: 'POST',
      body: JSON.stringify({ cinema, date }),
    })
      .then(res => res.json())
      .then((data: MovieData[]) => {
        setMovieData(data);
        setMovieList(
          data.map(movie => ({
            value: movie.id,
            label: movie.name,
          })),
        );
      });
  }, [cinema, date]);

  const getPreview = (id: string, link: string) => {
    setPreviews({ [id]: { loading: true } });

    fetch('/api/getPreview', {
      method: 'POST',
      body: JSON.stringify({ link }),
    })
      .then(res => res.json())
      .then(({ preview }) => {
        setPreviews({ [id]: { preview, loading: false } });
      })
      .catch(() => {
        setPreviews({ [id]: undefined });
      });
  };

  const movie = movieData.find(movie => movie.id === movieId);

  const events = movie?.events.filter(event =>
    attributes.every(attr => event.attributes.includes(attr)),
  );

  return (
    <Container>
      <Header height={50} mb={10}>
        <Container className={classes.header}>
          <Title order={3}>
            Cinema City Seat Finder <IconTicket />
          </Title>
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
          onChange={setMovieId}
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

      <Stack justify="flex-start">
        {events?.map(event => (
          <Card key={event.id} shadow="sm" padding="xs" radius="md" withBorder>
            <Group position="left" mb="md">
              <Title order={5}>{dayjs(event.dateTime).format('HH:mm')}</Title>
              {event.attributes
                .filter(attr => !!attributeValues[attr])
                .map(attr => (
                  <Badge key={attr} variant="light" color="yellow">
                    {attributeValues[attr]}
                  </Badge>
                ))}
              <Badge variant="outline" size="xs" color="gray">
                {event.auditorium}
              </Badge>
            </Group>

            <Center>
              {previews[event.id] ? (
                previews[event.id].loading ? (
                  <Loader size="xl" variant="bars" />
                ) : (
                  <Stack>
                    <Image
                      mx="auto"
                      src={
                        'data:image/png;base64, ' +
                        (previews[event.id].preview ?? '')
                      }
                    />
                    <Button
                      variant="light"
                      color="yellow"
                      radius="md"
                      component="a"
                      target="_blank"
                      href={event.link}
                    >
                      Kup bilet
                    </Button>
                  </Stack>
                )
              ) : (
                <Button
                  variant="light"
                  color="blue"
                  radius="md"
                  onClick={() => getPreview(event.id, event.link)}
                >
                  Sprawdź miejsca
                </Button>
              )}
            </Center>
          </Card>
        ))}
      </Stack>

      {events?.length === 0 && !!movie && (
        <Alert
          icon={<IconMoodSad size="1rem" />}
          title="Chyba nic takiego nie grają w tym kinie…"
          color="gray"
          variant="outline"
          mt={40}
        >
          Nie znależliśmy seansów spełniające podane kryteria. Zmień filtry albo
          dzień w ustawieniach wyszukiwania.
        </Alert>
      )}
    </Container>
  );
}
