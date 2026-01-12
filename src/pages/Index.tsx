import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Moment {
  id: string;
  text: string;
  date: Date;
  weekNumber: number;
  year: number;
  photo?: string;
}

const Index = () => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>();
  const [view, setView] = useState<'add' | 'timeline' | 'year'>('add');
  const [selectedWeek, setSelectedWeek] = useState<number>(getCurrentWeek());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  function getCurrentWeek(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  const getWeekOptions = () => {
    const weeks = [];
    for (let i = 1; i <= 52; i++) {
      weeks.push(i);
    }
    return weeks;
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMoment = () => {
    if (!currentText.trim()) {
      toast.error('Напишите воспоминание');
      return;
    }

    const newMoment: Moment = {
      id: Date.now().toString(),
      text: currentText,
      date: new Date(),
      weekNumber: selectedWeek,
      year: selectedYear,
      photo: currentPhoto
    };

    setMoments([newMoment, ...moments].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.weekNumber - a.weekNumber;
    }));
    setCurrentText('');
    setCurrentPhoto(undefined);
    setSelectedWeek(getCurrentWeek());
    setSelectedYear(new Date().getFullYear());
    toast.success('Момент сохранён! ✨');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getWeekDateRange = (weekNumber: number, year: number) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const weekStart = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const formatShort = (date: Date) => {
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short'
      }).format(date);
    };
    
    return `${formatShort(weekStart)} — ${formatShort(weekEnd)}`;
  };

  const currentYear = new Date().getFullYear();
  const yearMoments = moments
    .filter(m => m.year === currentYear)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-primary mb-3">52 недели</h1>
          <p className="text-muted-foreground text-lg">Лучшие моменты вашей жизни</p>
        </header>

        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          <Button
            onClick={() => setView('add')}
            variant={view === 'add' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Icon name="Plus" size={18} />
            Новый момент
          </Button>
          <Button
            onClick={() => setView('timeline')}
            variant={view === 'timeline' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Icon name="Calendar" size={18} />
            Все моменты
          </Button>
          <Button
            onClick={() => setView('year')}
            variant={view === 'year' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Icon name="Sparkles" size={18} />
            Итоги года
          </Button>
        </div>

        {view === 'add' && (
          <Card className="animate-scale-in shadow-xl border-2 border-accent/50">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Что особенного произошло?</h2>
                <p className="text-muted-foreground mb-4">
                  Запишите один самый яркий момент, который хочется запомнить
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Неделя</label>
                    <Select value={selectedWeek.toString()} onValueChange={(val) => setSelectedWeek(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getWeekOptions().map((week) => (
                          <SelectItem key={week} value={week.toString()}>
                            Неделя {week}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Год</label>
                    <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getYearOptions().map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Сегодня я..."
                className="min-h-[200px] mb-6 text-lg resize-none"
              />

              {currentPhoto && (
                <div className="mb-6 relative">
                  <img
                    src={currentPhoto}
                    alt="Момент"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => setCurrentPhoto(undefined)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full gap-2" type="button" asChild>
                    <span className="cursor-pointer">
                      <Icon name="ImagePlus" size={18} />
                      {currentPhoto ? 'Изменить фото' : 'Добавить фото'}
                    </span>
                  </Button>
                </label>
                <Button onClick={saveMoment} className="flex-1 gap-2">
                  <Icon name="Heart" size={20} />
                  Сохранить момент
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {view === 'timeline' && (
          <div className="space-y-6 animate-fade-in">
            {moments.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Пока нет воспоминаний</h3>
                <p className="text-muted-foreground mb-6">Начните записывать лучшие моменты своей жизни</p>
                <Button onClick={() => setView('add')}>
                  Создать первый момент
                </Button>
              </Card>
            ) : (
              moments.map((moment, index) => (
                <Card key={moment.id} className="overflow-hidden hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{moment.weekNumber}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Calendar" size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Неделя {moment.weekNumber} • {getWeekDateRange(moment.weekNumber, moment.year)}
                          </span>
                        </div>
                        {moment.photo && (
                          <img
                            src={moment.photo}
                            alt="Момент"
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <p className="text-lg leading-relaxed">{moment.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {view === 'year' && (
          <Card className="animate-scale-in shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold mb-2">Ваш {currentYear} год</h2>
                <p className="text-muted-foreground text-lg">
                  {yearMoments.length > 0 
                    ? `Сохранено ${yearMoments.length} ${yearMoments.length === 1 ? 'момент' : yearMoments.length < 5 ? 'момента' : 'моментов'}`
                    : 'Пока нет сохранённых моментов'
                  }
                </p>
              </div>

              {yearMoments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">
                    Начните записывать моменты, и к концу года у вас будет прекрасная коллекция воспоминаний
                  </p>
                  <Button onClick={() => setView('add')}>
                    Начать прямо сейчас
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {yearMoments.map((moment, index) => (
                    <div key={moment.id} className="pb-8 border-b last:border-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-bold text-primary">{moment.weekNumber}</span>
                        </div>
                        <div>
                          <div className="font-semibold">Неделя {moment.weekNumber}</div>
                          <div className="text-sm text-muted-foreground">{getWeekDateRange(moment.weekNumber, moment.year)}</div>
                        </div>
                      </div>
                      {moment.photo && (
                        <img
                          src={moment.photo}
                          alt={`Неделя ${moment.weekNumber}`}
                          className="w-full h-56 object-cover rounded-lg mb-4"
                        />
                      )}
                      <p className="text-lg leading-relaxed pl-15">{moment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;