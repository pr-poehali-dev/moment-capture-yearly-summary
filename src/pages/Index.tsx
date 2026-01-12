import { useState, useEffect } from 'react';
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
  title?: string;
  date: Date;
  weekNumber: number;
  year: number;
  photo?: string;
}

const Index = () => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>();
  const [view, setView] = useState<'add' | 'timeline' | 'year' | 'settings'>('add');
  const [selectedWeek, setSelectedWeek] = useState<number>(getCurrentWeek());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState('#8B5CF6');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  useEffect(() => {
    const savedMoments = localStorage.getItem('moments');
    if (savedMoments) {
      const parsed = JSON.parse(savedMoments);
      setMoments(parsed.map((m: any) => ({ ...m, date: new Date(m.date) })));
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);

    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) setAccentColor(savedAccent);

    const savedBg = localStorage.getItem('bgColor');
    if (savedBg) setBgColor(savedBg);
  }, []);

  useEffect(() => {
    localStorage.setItem('moments', JSON.stringify(moments));
  }, [moments]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('bgColor', bgColor);
    document.documentElement.style.setProperty('--bg-color', bgColor);
  }, [bgColor]);

  function getCurrentWeek(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  const getWeekOptions = () => {
    const currentWeek = getCurrentWeek();
    const currentYearNow = new Date().getFullYear();
    const weeks = [];
    
    if (selectedYear < currentYearNow) {
      for (let i = 1; i <= 52; i++) {
        weeks.push(i);
      }
    } else if (selectedYear === currentYearNow) {
      for (let i = 1; i <= currentWeek; i++) {
        weeks.push(i);
      }
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

    if (editingId) {
      setMoments(moments.map(m => 
        m.id === editingId 
          ? { ...m, text: currentText, title: currentTitle.trim() || undefined, photo: currentPhoto, weekNumber: selectedWeek, year: selectedYear }
          : m
      ));
      setEditingId(null);
      toast.success('Момент обновлён! ✨');
    } else {
      const newMoment: Moment = {
        id: Date.now().toString(),
        text: currentText,
        title: currentTitle.trim() || undefined,
        date: new Date(),
        weekNumber: selectedWeek,
        year: selectedYear,
        photo: currentPhoto
      };

      setMoments([newMoment, ...moments].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.weekNumber - a.weekNumber;
      }));
      toast.success('Момент сохранён! ✨');
    }

    setCurrentText('');
    setCurrentTitle('');
    setCurrentPhoto(undefined);
    setSelectedWeek(getCurrentWeek());
    setSelectedYear(new Date().getFullYear());
    setView('timeline');
  };

  const startEdit = (moment: Moment) => {
    setEditingId(moment.id);
    setCurrentText(moment.text);
    setCurrentTitle(moment.title || '');
    setCurrentPhoto(moment.photo);
    setSelectedWeek(moment.weekNumber);
    setSelectedYear(moment.year);
    setView('add');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCurrentText('');
    setCurrentTitle('');
    setCurrentPhoto(undefined);
    setSelectedWeek(getCurrentWeek());
    setSelectedYear(new Date().getFullYear());
  };

  const deleteMoment = (id: string) => {
    setMoments(moments.filter(m => m.id !== id));
    toast.success('Момент удалён');
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
          <Button
            onClick={() => setView('settings')}
            variant={view === 'settings' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Icon name="Settings" size={18} />
            Настройки
          </Button>
        </div>

        {view === 'add' && (
          <Card className="animate-scale-in shadow-xl border-2 border-accent/50">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">{editingId ? 'Редактировать момент' : 'Что особенного произошло?'}</h2>
                <p className="text-muted-foreground mb-4">
                  {editingId ? 'Внесите изменения в ваш момент' : 'Запишите один самый яркий момент, который хочется запомнить'}
                </p>
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Заголовок (опционально)</label>
                  <Input
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="Например: Поездка в горы"
                    className="text-lg"
                  />
                </div>
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
                placeholder="На этой неделе..."
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
                {editingId && (
                  <Button onClick={cancelEdit} variant="outline" className="flex-1 gap-2">
                    <Icon name="X" size={18} />
                    Отмена
                  </Button>
                )}
                <Button onClick={saveMoment} className="flex-1 gap-2">
                  <Icon name="Heart" size={20} />
                  {editingId ? 'Обновить' : 'Сохранить момент'}
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
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" size={16} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Неделя {moment.weekNumber} • {getWeekDateRange(moment.weekNumber, moment.year)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => startEdit(moment)} size="sm" variant="ghost">
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button onClick={() => deleteMoment(moment.id)} size="sm" variant="ghost">
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
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
                          <div className="font-semibold">{moment.title || `Неделя ${moment.weekNumber}`}</div>
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

        {view === 'settings' && (
          <Card className="animate-scale-in shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Настройки оформления</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Тема</label>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setTheme('light')}
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                    >
                      <Icon name="Sun" size={18} />
                      Светлая
                    </Button>
                    <Button
                      onClick={() => setTheme('dark')}
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                    >
                      <Icon name="Moon" size={18} />
                      Тёмная
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Акцентный цвет</label>
                  <div className="flex gap-3 flex-wrap">
                    {['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'].map(color => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className="w-12 h-12 rounded-full border-2 transition-all"
                        style={{ 
                          backgroundColor: color,
                          borderColor: accentColor === color ? color : 'transparent',
                          transform: accentColor === color ? 'scale(1.1)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="mt-3 h-12 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Цвет фона</label>
                  <div className="flex gap-3 flex-wrap">
                    {['#FFFFFF', '#F3F4F6', '#FEF3C7', '#DBEAFE', '#FCE7F3'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className="w-12 h-12 rounded-full border-2 transition-all"
                        style={{ 
                          backgroundColor: color,
                          borderColor: bgColor === color ? accentColor : '#E5E7EB',
                          transform: bgColor === color ? 'scale(1.1)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="mt-3 h-12 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;