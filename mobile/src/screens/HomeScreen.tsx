import { useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createEvent, listEvents } from '../api/eventsApi';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';
import type { CreateEventPayload, EventItem } from '../types/event';

type TabKey = 'home' | 'events' | 'jobs' | 'study' | 'profile';

const avatars = {
  alex: { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80' },
  student: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80' },
  teammate: { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' }
};

const images = {
  techHall: { uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80' },
  campusEvent: { uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80' },
  lawn: { uri: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=300&q=80' },
  concert: { uri: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80' },
  workshop: { uri: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=260&q=80' },
  notes: { uri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80' }
};

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'events', label: 'Schedule', icon: '□' },
  { key: 'jobs', label: 'Jobs', icon: '▣' },
  { key: 'study', label: 'Study', icon: '▤' },
  { key: 'profile', label: 'Profile', icon: '♙' }
];

export function HomeScreen() {
  const { logout, setLocalProfilePhoto, updateProfile, user, isSubmitting } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const displayName = useMemo(() => user?.name?.split(' ')[0] || 'Alex', [user?.name]);
  const isStudent = user?.role === 'STUDENT';
  const canCreateAdminContent = useMemo(
    () =>
      user?.role === 'PLATFORM_ADMIN' ||
      ((user?.role === 'COLLEGE_ADMIN' || user?.role === 'ADMIN') && user?.approvalStatus === 'APPROVED'),
    [user?.approvalStatus, user?.role]
  );
  const showEventApprovalMessage = useMemo(
    () =>
      !canCreateAdminContent &&
      (user?.role === 'COLLEGE_ADMIN' || user?.role === 'ADMIN') &&
      user?.approvalStatus !== 'APPROVED',
    [canCreateAdminContent, user?.approvalStatus, user?.role]
  );
  const isAdminPendingApproval = showEventApprovalMessage;
  const showAddAction =
    activeTab !== 'profile' &&
    !isAdminPendingApproval &&
    (!isStudent || (activeTab !== 'events' && activeTab !== 'jobs' && activeTab !== 'study'));

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await listEvents();
        setEvents(response);
      } catch {
        setEvents([]);
      }
    };

    loadEvents();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header user={user} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'home' && <HomeDashboard name={displayName} />}
        {activeTab === 'events' && (
          <EventsScreen
            canCreateEvents={canCreateAdminContent}
            showApprovalMessage={showEventApprovalMessage}
            events={events}
            isCreatingEvent={isCreatingEvent}
            onCreateEvent={async (payload) => {
              setIsCreatingEvent(true);
              try {
                const created = await createEvent(payload);
                setEvents((prev) => [created, ...prev]);
                Alert.alert('Success', 'Event published successfully.');
              } catch {
                Alert.alert('Could not create event', 'Check all event details and your admin approval status.');
              } finally {
                setIsCreatingEvent(false);
              }
            }}
          />
        )}
        {activeTab === 'jobs' && <JobsScreen />}
        {activeTab === 'study' && <StudyScreen canCreateStudyMaterial={canCreateAdminContent} />}
        {activeTab === 'profile' && (
          <ProfileScreen
            canEditProfile={!isAdminPendingApproval}
            isSaving={isSubmitting}
            onLogout={logout}
            onPickPhoto={setLocalProfilePhoto}
            onSave={updateProfile}
            user={user}
          />
        )}
      </ScrollView>
      {showAddAction && <FloatingAction icon={activeTab === 'study' ? '✎' : '+'} />}
      <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

function Header({ user }: { user: User | null }) {
  const avatar = getProfileImageSource(user);

  return (
    <View style={styles.header}>
      <Image source={avatar} style={styles.headerAvatar} />
      <Text style={styles.brand}>Campus Connect</Text>
      <Text style={styles.bell}>♧</Text>
    </View>
  );
}

function getProfileImageSource(user?: User | null): ImageSourcePropType {
  if (user?.profilePhotoUrl) {
    return { uri: user.profilePhotoUrl };
  }

  return avatars.student;
}

function HomeDashboard({ name }: { name: string }) {
  return (
    <>
      <View style={styles.heroIntro}>
        <View style={styles.heroCard}>
          <Text style={styles.h1}>Hello, {name}</Text>
          <Text style={styles.lead}>You have 3 classes today and 2 upcoming events.</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatPill}>
              <Text style={styles.heroStatLabel}>Next class</Text>
              <Text style={styles.heroStatValue}>10:30 AM</Text>
            </View>
            <View style={styles.heroStatPill}>
              <Text style={styles.heroStatLabel}>Due today</Text>
              <Text style={styles.heroStatValue}>2 tasks</Text>
            </View>
          </View>
        </View>
      </View>

      <SectionTitle title="Quick Access" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        <QuickCard icon="□" label="Explore" title="Events" />
        <QuickCard icon="▣" label="Campus" title="Jobs" />
        <QuickCard icon="▤" label="Study" title="Notes" />
      </ScrollView>

      <SectionTitle title="Upcoming Events" action="See all" />
      <FeaturedEvent />
      <MiniEvent image={images.lawn} label="Workshop" title="Creative Coding 101" meta="Engineering Hall, Rm 4" />
      <MiniEvent image={images.concert} label="Social" title="Acoustic Campus Night" meta="Student Union Plaza" />

      <SectionTitle title="Curated For You" />
      <View style={styles.curatedGrid}>
        <View style={styles.curatedTall}>
          <Text style={styles.curatedIcon}>▣</Text>
          <Text style={styles.curatedTitle}>Summer Internships are open!</Text>
          <Text style={styles.curatedCopy}>Apply for top-tier tech roles directly through our partner portal.</Text>
          <View style={styles.whitePill}>
            <Text style={styles.whitePillText}>Explore Jobs</Text>
          </View>
        </View>
        <View style={styles.curatedColumn}>
          <View style={styles.tipCard}>
            <Text style={styles.tagText}>Study Tip</Text>
            <Text style={styles.tipTitle}>The Pomodoro Technique</Text>
            <Text style={styles.tipBody}>Boost your productivity during...</Text>
          </View>
          <View style={styles.hubCard}>
            <Text style={styles.tagText}>Campus Hub</Text>
            <Text style={styles.tipTitle}>Book Study Room</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
      </View>
    </>
  );
}

function EventsScreen({
  canCreateEvents,
  showApprovalMessage,
  events,
  isCreatingEvent,
  onCreateEvent
}: {
  canCreateEvents: boolean;
  showApprovalMessage: boolean;
  events: EventItem[];
  isCreatingEvent: boolean;
  onCreateEvent: (payload: CreateEventPayload) => Promise<void>;
}) {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  return (
    <>
      <Text style={styles.screenTitle}>Campus Events</Text>
      {canCreateEvents ? (
        <View style={styles.eventFormCard}>
          <Text style={styles.formTitle}>Add Event</Text>
          <TextInput value={eventName} onChangeText={setEventName} placeholder="Event name" style={styles.profileInput} />
          <TextInput value={eventDate} onChangeText={setEventDate} placeholder="Date (YYYY-MM-DD)" style={styles.profileInput} />
          <TextInput value={startTime} onChangeText={setStartTime} placeholder="Start time (HH:mm)" style={styles.profileInput} />
          <TextInput value={endTime} onChangeText={setEndTime} placeholder="End time (HH:mm)" style={styles.profileInput} />
          <TextInput value={venue} onChangeText={setVenue} placeholder="Venue" style={styles.profileInput} />
          <TextInput value={collegeName} onChangeText={setCollegeName} placeholder="College name" style={styles.profileInput} />
          <TextInput value={city} onChangeText={setCity} placeholder="City" style={styles.profileInput} />
          <TextInput value={state} onChangeText={setState} placeholder="State" style={styles.profileInput} />
          <TextInput value={category} onChangeText={setCategory} placeholder="Category (Tech, Cultural, Sports...)" style={styles.profileInput} />
          <TextInput value={description} onChangeText={setDescription} placeholder="Event description (20+ chars)" style={styles.profileInput} multiline />
          <TextInput value={organizerName} onChangeText={setOrganizerName} placeholder="Organizer name" style={styles.profileInput} />
          <TextInput value={organizerEmail} onChangeText={setOrganizerEmail} placeholder="Organizer email" style={styles.profileInput} />
          <TextInput value={contactPhone} onChangeText={setContactPhone} placeholder="Contact phone" style={styles.profileInput} />
          <TextInput value={registrationLink} onChangeText={setRegistrationLink} placeholder="Registration link (optional)" style={styles.profileInput} />
          <TextInput value={bannerImageUrl} onChangeText={setBannerImageUrl} placeholder="Banner image URL (optional)" style={styles.profileInput} />
          <Pressable
            disabled={isCreatingEvent}
            onPress={async () => {
              await onCreateEvent({
                eventName,
                eventDate,
                startTime,
                endTime,
                venue,
                collegeName,
                city,
                state,
                category,
                description,
                organizerName,
                organizerEmail,
                contactPhone,
                registrationLink,
                bannerImageUrl
              });
            }}
            style={[styles.profileActionButton, styles.profileSaveButton, isCreatingEvent && styles.profileDisabledButton]}
          >
            <Text style={styles.profileSaveText}>{isCreatingEvent ? 'Publishing...' : 'Publish Event'}</Text>
          </Pressable>
        </View>
      ) : showApprovalMessage ? (
        <Text style={styles.mutedLine}>Waiting for platform admin approval. You can add events after approval.</Text>
      ) : null
      }

      {events.map((event) => (
        <EventCard
          key={event.id}
          image={event.bannerImageUrl ? { uri: event.bannerImageUrl } : images.campusEvent}
          title={event.eventName}
          college={event.collegeName}
          date={`${event.eventDate} • ${event.startTime} - ${event.endTime}`}
          place={`${event.venue}, ${event.city}`}
          action="View"
          interest={event.category}
        />
      ))}
      {events.length === 0 ? <Text style={styles.mutedLine}>No events yet.</Text> : null}
    </>
  );
}

function JobsScreen() {
  return (
    <>
      <Text style={styles.screenTitle}>Opportunities</Text>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Search roles, companies...</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Filter active label="All Jobs" />
        <Filter label="Internship" />
        <Filter label="Full-time" />
        <Filter label="Remote" />
      </ScrollView>
      <JobCard icon="♢" title="UX Design Intern" company="Lumina Tech Labs" tags={['Internship', 'Remote', '$35/hr']} place="San Francisco, CA" />
      <JobCard icon="‹›" title="Junior Web Developer" company="Global Nexus Systems" tags={['Full-time', 'On-site']} place="New York, NY" warm />
      <View style={styles.jobCard}>
        <Text style={styles.hotLabel}>HOT OPPORTUNITY</Text>
        <Text style={styles.jobTitleStandalone}>Data Science Research</Text>
        <Text style={styles.jobCompanyStandalone}>University Research Wing</Text>
        <View style={styles.jobFooter}>
          <Text style={styles.mutedLine}>◷ Part-time</Text>
          <View style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>View details</Text>
          </View>
        </View>
      </View>
      <JobCard icon="◌" title="Creative Director Assistant" company="Studio Flow" tags={['Internship', 'Hybrid']} place="Austin, TX" />
    </>
  );
}

function StudyScreen({ canCreateStudyMaterial }: { canCreateStudyMaterial: boolean }) {
  return (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>AI Smart Summary</Text>
        <Text style={styles.summaryText}>Instant insights from your lecture notes using neural processing.</Text>
        <View style={styles.generateButton}>
          <Text style={styles.generateText}>✧ Generate Now</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Filter active label="All Notes" />
        <Filter label="Mathematics" />
        <Filter label="Computer Science" />
      </ScrollView>
      {canCreateStudyMaterial ? (
        <View style={styles.createNote}>
          <Text style={styles.createIcon}>⊕</Text>
          <Text style={styles.createText}>Create New Note</Text>
        </View>
      ) : (
        <Text style={styles.mutedLine}>Waiting for platform admin approval. You can add notes after approval.</Text>
      )}
      <NoteCard tag="Mathematics" title="Calculus II: Taylor Series" body="Discussion on convergence of power series and the radius of convergence. Remember to review the remainder..." foot="Updated 2h ago" />
      <NoteCard tag="Computer Science" title="Data Structures: Red-Black Trees" body="Rules for balancing: 1. Every node is red or black. 2. Root is black. 3. Every leaf (NIL) is black. 4. Red node children are..." foot="Updated Yesterday" warm />
      <View style={styles.imageNote}>
        <Image source={images.notes} style={styles.noteImage} />
        <View style={styles.attachmentPill}>
          <Text style={styles.linkText}>⊂ 3 Attachments</Text>
        </View>
        <View style={styles.imageNoteBody}>
          <Text style={styles.noteTitle}>Modernist Poetry Seminar</Text>
          <Text style={styles.noteBody}>Annotated analysis of T.S. Eliot's The Waste Land. Focus on the fragmentation and mythological references.</Text>
          <Text style={styles.noteFoot}>◷ Added 3 days ago</Text>
        </View>
      </View>
    </>
  );
}

function ProfileScreen({
  canEditProfile,
  isSaving,
  onLogout,
  onPickPhoto,
  onSave,
  user
}: {
  canEditProfile: boolean;
  isSaving: boolean;
  onLogout: () => void;
  onPickPhoto: (photoUri: string | null) => Promise<void>;
  onSave: (payload: { name: string; university: string; profilePhotoUrl?: string | null }) => Promise<void>;
  user: User | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name || '');
  const [draftUniversity, setDraftUniversity] = useState(user?.university || '');
  const [formError, setFormError] = useState('');
  const photoPreview = getProfileImageSource(user);
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Not available';

  return (
    <View style={styles.profileWrap}>
      <View style={styles.profilePhotoWrap}>
        <Image source={photoPreview} style={styles.profilePhoto} />
        {canEditProfile ? (
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => {
              setDraftName(user?.name || '');
              setDraftUniversity(user?.university || '');
              setFormError('');
              setIsEditing(true);
            }}
            style={styles.editBubble}
          >
            <Text style={styles.editText}>✎</Text>
          </Pressable>
        ) : null}
      </View>
      {!canEditProfile ? (
        <Text style={styles.mutedLine}>Waiting for platform admin approval. Profile editing is disabled.</Text>
      ) : null}
      {isEditing ? (
        <View style={styles.editForm}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            autoCapitalize="words"
            editable={!isSaving}
            onChangeText={setDraftName}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            style={styles.profileInput}
            value={draftName}
          />
          <Text style={styles.inputLabel}>University</Text>
          <TextInput
            autoCapitalize="words"
            editable={!isSaving}
            onChangeText={setDraftUniversity}
            placeholder="Your university"
            placeholderTextColor={colors.muted}
            style={styles.profileInput}
            value={draftUniversity}
          />
          <Text style={styles.inputLabel}>Profile Photo</Text>
          <Pressable
            disabled={isSaving}
            onPress={async () => {
              const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

              if (!permission.granted) {
                setFormError('Gallery access is required to choose a profile photo.');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8
              });

              if (!result.canceled && result.assets[0]?.uri) {
                await onPickPhoto(result.assets[0].uri);
                setFormError('');
              }
            }}
            style={[styles.profileActionButton, styles.profileCancelButton]}
          >
            <Text style={styles.profileCancelText}>Choose from gallery</Text>
          </Pressable>
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <View style={styles.profileActions}>
            <Pressable
              disabled={isSaving}
              onPress={() => {
                setIsEditing(false);
                setFormError('');
              }}
              style={[styles.profileActionButton, styles.profileCancelButton]}
            >
              <Text style={styles.profileCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={isSaving}
              onPress={async () => {
                const name = draftName.trim();
                const university = draftUniversity.trim();

                if (name.length < 2 || university.length < 2) {
                  setFormError('Name and university must be at least 2 characters.');
                  return;
                }

                try {
                  setFormError('');
                  await onSave({
                    name,
                    university,
                    profilePhotoUrl: user?.profilePhotoUrl || null
                  });
                  setIsEditing(false);
                } catch (error) {
                  setFormError(error instanceof Error ? error.message : 'Unable to update profile.');
                }
              }}
              style={[styles.profileActionButton, styles.profileSaveButton, isSaving && styles.profileDisabledButton]}
            >
              <Text style={styles.profileSaveText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.profileName}>{user?.name || 'Campus Connect User'}</Text>
          <Text style={styles.profileMeta}>{user?.university || 'University not added'}</Text>
        </>
      )}
      <View style={styles.activeBadge}>
        <Text style={styles.activeDot}>●</Text>
        <Text style={styles.activeText}>Active Now</Text>
      </View>

      <Text style={styles.settingsTitle}>REGISTRATION DETAILS</Text>
      <View style={styles.detailsCard}>
        <ProfileDetail label="Full Name" value={user?.name || 'Not available'} />
        <ProfileDetail label="Email" value={user?.email || 'Not available'} />
        <ProfileDetail label="University" value={user?.university || 'Not available'} />
        <ProfileDetail label="Role" value={formatRole(user?.role)} />
        <ProfileDetail label="Joined" value={joinedDate} last />
      </View>

      <Text style={styles.settingsTitle}>ACCOUNT SETTINGS</Text>
      <View style={styles.settingsCard}>
        <SettingsRow icon="⚙" title="Settings" />
        <SettingsRow icon="▣" title="Privacy" />
        <SettingsRow icon="?" title="Help" last />
      </View>
      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>⇥  Logout</Text>
      </Pressable>
      <Text style={styles.version}>Campus Connect Version 2.4.0 (Build 108)</Text>
    </View>
  );
}

function ProfileDetail({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.profileDetailRow, last && styles.profileDetailRowLast]}>
      <Text style={styles.profileDetailLabel}>{label}</Text>
      <Text style={styles.profileDetailValue}>{value}</Text>
    </View>
  );
}

function formatRole(role?: string) {
  if (!role) {
    return 'Not available';
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function QuickCard({ icon, label, title }: { icon: string; label: string; title: string }) {
  return (
    <View style={styles.quickCard}>
      <View style={styles.iconSoft}>
        <Text style={styles.iconPrimary}>{icon}</Text>
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickTitle}>{title}</Text>
    </View>
  );
}

function FeaturedEvent() {
  return (
    <View style={styles.featuredCard}>
      <Image source={images.techHall} style={styles.featuredImage} />
      <View style={styles.featuredOverlay} />
      <View style={styles.featuredText}>
        <Text style={styles.featuredBadge}>FEATURED EVENT</Text>
        <Text style={styles.featuredTitle}>Global Tech Symposium</Text>
        <Text style={styles.featuredTime}>◷ Today, 4:00 PM</Text>
      </View>
    </View>
  );
}

function MiniEvent({ image, label, title, meta }: { image: ImageSourcePropType; label: string; title: string; meta: string }) {
  return (
    <View style={styles.miniEvent}>
      <Image source={image} style={styles.miniImage} />
      <View style={styles.flex}>
        <Text style={styles.tagText}>{label}</Text>
        <Text style={styles.miniTitle}>{title}</Text>
        <Text style={styles.miniMeta}>{meta}</Text>
      </View>
    </View>
  );
}

function Filter({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.filterPill, active && styles.filterPillActive]}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </View>
  );
}

function EventCard({
  image,
  title,
  college,
  date,
  place,
  action,
  live,
  interest
}: {
  image: ImageSourcePropType;
  title: string;
  college: string;
  date: string;
  place: string;
  action: string;
  live?: boolean;
  interest?: string;
}) {
  return (
    <View style={styles.eventCard}>
      <View>
        <Image source={image} style={styles.eventImage} />
        {live ? (
          <View style={styles.livePill}>
            <Text style={styles.linkText}>LIVE</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.eventBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.eventTitle}>{title}</Text>
          <Text style={styles.bookmark}>♧</Text>
        </View>
        <Text style={styles.eventMeta}>◈  {college}</Text>
        <Text style={styles.eventMeta}>□  {date}</Text>
        <Text style={styles.eventMeta}>⌖  {place}</Text>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <Text style={styles.italicText}>{interest || '👤 👤 👤 +42'}</Text>
          <View style={styles.eventButton}>
            <Text style={styles.eventButtonText}>{action}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function JobCard({
  icon,
  title,
  company,
  tags,
  place,
  warm
}: {
  icon: string;
  title: string;
  company: string;
  tags: string[];
  place: string;
  warm?: boolean;
}) {
  return (
    <View style={styles.jobCard}>
      <View style={styles.jobTop}>
        <View style={[styles.jobIcon, warm && styles.jobIconWarm]}>
          <Text style={[styles.jobIconText, warm && styles.jobIconWarmText]}>{icon}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.jobTitle}>{title}</Text>
          <Text style={styles.jobCompany}>{company}</Text>
        </View>
        <Text style={styles.bookmark}>♧</Text>
      </View>
      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.jobTag}>
            <Text style={styles.jobTagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.eventMeta}>⌖  {place}</Text>
      <View style={styles.applyButton}>
        <Text style={styles.applyText}>Apply Now</Text>
      </View>
    </View>
  );
}

function NoteCard({ tag, title, body, foot, warm }: { tag: string; title: string; body: string; foot: string; warm?: boolean }) {
  return (
    <View style={styles.noteCard}>
      <View style={styles.rowBetween}>
        <View style={[styles.noteTag, warm && styles.noteTagWarm]}>
          <Text style={[styles.noteTagText, warm && styles.noteTagWarmText]}>{tag}</Text>
        </View>
        <Text style={styles.noteActions}>✎  ♲</Text>
      </View>
      <Text style={styles.noteTitle}>{title}</Text>
      <Text style={styles.noteBody}>{body}</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.noteFoot}>◷  {foot}</Text>
        <Text style={styles.aiBadge}>{warm ? '👤' : 'AI'}</Text>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, title, last }: { icon: string; title: string; last?: boolean }) {
  return (
    <View style={[styles.settingsRow, last && styles.settingsRowLast]}>
      <View style={styles.settingsIcon}>
        <Text style={styles.iconPrimary}>{icon}</Text>
      </View>
      <Text style={styles.settingsText}>{title}</Text>
      <Text style={styles.settingsChevron}>›</Text>
    </View>
  );
}

function FloatingAction({ icon }: { icon: string }) {
  return (
    <View style={styles.fab}>
      <Text style={styles.fabText}>{icon}</Text>
    </View>
  );
}

function BottomTabs({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.bottomTabs}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable key={tab.key} style={styles.tabButton} onPress={() => onChange(tab.key)}>
            <Text style={[styles.tabIcon, active && styles.tabActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, active && styles.tabActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f1eef8',
    borderColor: '#c9c1dc',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 24,
    paddingVertical: 8
  },
  activeDot: {
    color: colors.success,
    fontSize: 14
  },
  activeText: {
    color: '#4b4658',
    fontSize: 17,
    fontWeight: '600'
  },
  aiBadge: {
    backgroundColor: '#e8edff',
    borderRadius: 12,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 5
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 22,
    paddingVertical: 16
  },
  applyText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800'
  },
  arrow: {
    bottom: 26,
    color: colors.primary,
    fontSize: 34,
    position: 'absolute',
    right: 24
  },
  attachmentPill: {
    backgroundColor: '#eafff8',
    borderRadius: 18,
    left: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    position: 'absolute',
    top: 18
  },
  bell: {
    color: colors.primary,
    fontSize: 26,
    marginLeft: 'auto'
  },
  bookmark: {
    color: '#6e6b80',
    fontSize: 26
  },
  bottomTabs: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 78,
    paddingHorizontal: 16,
    paddingTop: 10
  },
  brand: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 0,
    marginLeft: 14
  },
  compactEvent: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 20,
    marginHorizontal: 24,
    marginTop: 24,
    padding: 20
  },
  compactImage: {
    borderRadius: 8,
    height: 92,
    width: 92
  },
  compactTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 27
  },
  createIcon: {
    color: '#777489',
    fontSize: 30,
    fontWeight: '800'
  },
  createNote: {
    alignItems: 'center',
    borderColor: '#c9c1dc',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 8,
    marginHorizontal: 24,
    marginTop: 8,
    paddingVertical: 26
  },
  createText: {
    color: '#777489',
    fontSize: 22,
    fontWeight: '800'
  },
  detailsButton: {
    backgroundColor: '#6200d8',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 13
  },
  detailsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 18,
    width: '100%'
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginVertical: 20
  },
  editBubble: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    bottom: 8,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    width: 56
  },
  editText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900'
  },
  editForm: {
    marginTop: 24,
    width: '100%'
  },
  eventFormCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16
  },
  eventBody: {
    padding: 22
  },
  eventButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14
  },
  eventButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 24,
    marginTop: 24,
    overflow: 'hidden'
  },
  eventImage: {
    height: 246,
    width: '100%'
  },
  eventMeta: {
    color: '#242235',
    fontSize: 16,
    lineHeight: 29
  },
  eventTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28
  },
  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 34,
    bottom: 86,
    elevation: 8,
    height: 68,
    justifyContent: 'center',
    position: 'absolute',
    right: 28,
    shadowColor: colors.primary,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    width: 68,
    zIndex: 4
  },
  fabText: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 38
  },
  featuredImage: {
    height: '100%',
    width: '100%'
  },
  filterPill: {
    backgroundColor: '#eeeaf6',
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 13
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 20
  },
  filterText: {
    color: '#302d3f',
    fontSize: 17,
    fontWeight: '500'
  },
  filterTextActive: {
    color: colors.white
  },
  flex: {
    flex: 1
  },
  formError: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2
  },
  generateButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 12
  },
  generateText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1
  },
  h1: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 64,
    paddingHorizontal: 22
  },
  headerAvatar: {
    borderRadius: 21,
    height: 42,
    width: 42
  },
  heroIntro: {
    paddingHorizontal: 20,
    paddingTop: 24
  },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 22
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18
  },
  heroStatPill: {
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    borderColor: 'rgba(226, 232, 240, 0.22)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  heroStatLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700'
  },
  heroStatValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2
  },
  hotLabel: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffdcd8',
    borderRadius: 6,
    color: '#8c160c',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  iconPrimary: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900'
  },
  iconSoft: {
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    marginBottom: 14,
    width: 48
  },
  imageNote: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 24,
    marginTop: 18,
    overflow: 'hidden'
  },
  imageNoteBody: {
    padding: 24
  },
  inputLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 12
  },
  italicText: {
    color: '#242235',
    fontSize: 16,
    fontStyle: 'italic'
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 24,
    marginTop: 22,
    padding: 20
  },
  jobCompany: {
    color: '#302d3f',
    fontSize: 19,
    marginTop: 4
  },
  jobCompanyStandalone: {
    color: '#302d3f',
    fontSize: 19,
    lineHeight: 30,
    marginTop: 8
  },
  jobFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26
  },
  jobIcon: {
    alignItems: 'center',
    backgroundColor: '#eff2ff',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    width: 56
  },
  jobIconText: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '900'
  },
  jobIconWarm: {
    backgroundColor: '#fff8e8'
  },
  jobIconWarmText: {
    color: '#9a2a00'
  },
  jobTag: {
    backgroundColor: '#f0eafa',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 7
  },
  jobTagText: {
    color: '#332440',
    fontSize: 15
  },
  jobTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 29
  },
  jobTitleStandalone: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16
  },
  jobTop: {
    flexDirection: 'row',
    gap: 16
  },
  lead: {
    color: '#dbeafe',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700'
  },
  livePill: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: 'absolute',
    right: 20,
    top: 20
  },
  logoutButton: {
    alignItems: 'center',
    borderColor: '#ffc6c1',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 38,
    paddingVertical: 22,
    width: '100%'
  },
  logoutText: {
    color: '#b80f0a',
    fontSize: 24,
    fontWeight: '800'
  },
  miniEvent: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#dbe3ef',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14
  },
  miniImage: {
    borderRadius: 20,
    height: 84,
    width: 84
  },
  miniMeta: {
    color: '#302d3f',
    fontSize: 15,
    marginTop: 4
  },
  miniTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4
  },
  mutedLine: {
    color: '#242235',
    fontSize: 16,
    lineHeight: 26,
    marginTop: 14
  },
  noteActions: {
    color: '#6e6b80',
    fontSize: 24
  },
  noteBody: {
    color: '#302d3f',
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 26,
    marginTop: 18
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 24,
    marginTop: 18,
    padding: 24
  },
  noteFoot: {
    color: '#6f6a80',
    fontSize: 14,
    fontWeight: '600'
  },
  noteImage: {
    height: 182,
    width: '100%'
  },
  noteTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e7c9ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  noteTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  noteTagWarm: {
    backgroundColor: '#ffd9cc'
  },
  noteTagWarmText: {
    color: '#8f2b05'
  },
  noteTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginTop: 12
  },
  profileMeta: {
    color: '#4b4658',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center'
  },
  profileName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginTop: 24,
    textAlign: 'center'
  },
  profileDetailLabel: {
    color: '#7b8aa0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase'
  },
  profileDetailRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14
  },
  profileDetailRowLast: {
    borderBottomWidth: 0
  },
  profileDetailValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 5
  },
  profileActionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center'
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  profileCancelButton: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1
  },
  profileCancelText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800'
  },
  profileDisabledButton: {
    opacity: 0.6
  },
  profileInput: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14
  },
  profileSaveButton: {
    backgroundColor: colors.primary
  },
  profileSaveText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'
  },
  profilePhoto: {
    borderColor: colors.white,
    borderRadius: 70,
    borderWidth: 6,
    height: 126,
    width: 126
  },
  profilePhotoWrap: {
    alignSelf: 'center',
    borderColor: colors.primary,
    borderRadius: 76,
    borderWidth: 6,
    marginTop: 58
  },
  profileWrap: {
    alignItems: 'center',
    paddingHorizontal: 34
  },
  quickCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 16,
    borderWidth: 1,
    height: 136,
    padding: 16,
    width: 154
  },
  quickLabel: {
    color: '#64748b',
    fontSize: 13,
    letterSpacing: 0.4
  },
  quickRow: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18
  },
  quickTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1
  },
  screenTitle: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  scrollContent: {
    paddingBottom: 110
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginHorizontal: 24,
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 18
  },
  searchIcon: {
    color: '#6e6b80',
    fontSize: 26
  },
  searchText: {
    color: '#6e6b80',
    fontSize: 18
  },
  sectionAction: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '800'
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900'
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 24
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 18,
    width: '100%'
  },
  settingsChevron: {
    color: '#cbd3df',
    fontSize: 42,
    marginLeft: 'auto'
  },
  settingsIcon: {
    alignItems: 'center',
    backgroundColor: '#eef1ff',
    borderRadius: 13,
    height: 48,
    justifyContent: 'center',
    width: 48
  },
  settingsRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 18
  },
  settingsRowLast: {
    borderBottomWidth: 0
  },
  settingsText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700'
  },
  settingsTitle: {
    alignSelf: 'flex-start',
    color: '#9aa8bc',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 34
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 30
  },
  statLabel: {
    color: '#98a6ba',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12
  },
  statRow: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 42,
    width: '100%'
  },
  statValue: {
    color: colors.primary,
    fontSize: 31,
    fontWeight: '900'
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    marginHorizontal: 20,
    marginTop: 34,
    padding: 26
  },
  summaryText: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 26,
    marginTop: 8
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '900'
  },
  tabActive: {
    color: colors.primary
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 4
  },
  tabIcon: {
    color: '#8ba0ba',
    fontSize: 25,
    fontWeight: '800',
    height: 28
  },
  tabLabel: {
    color: '#8194ad',
    fontSize: 11
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
    marginTop: 20
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  tipBody: {
    color: '#302d3f',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5
  },
  tipCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    minHeight: 142,
    padding: 18
  },
  tipTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
    marginTop: 10
  },
  version: {
    color: '#98a6ba',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 30,
    textAlign: 'center'
  },
  whitePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  whitePillText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900'
  },
  curatedColumn: {
    flex: 1,
    gap: 12
  },
  curatedCopy: {
    color: '#dbeafe',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12
  },
  curatedGrid: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 8
  },
  curatedIcon: {
    color: '#bfdbfe',
    fontSize: 28
  },
  curatedTall: {
    backgroundColor: '#1e3a8a',
    borderRadius: 20,
    flex: 1,
    minHeight: 230,
    padding: 18
  },
  curatedTitle: {
    color: '#eff6ff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
    marginTop: 20
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0ea5e9',
    borderRadius: 14,
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  featuredCard: {
    borderRadius: 22,
    height: 235,
    marginHorizontal: 20,
    marginTop: 10,
    overflow: 'hidden'
  },
  featuredOverlay: {
    backgroundColor: 'rgba(2,6,23,0.45)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  featuredText: {
    bottom: 18,
    left: 18,
    position: 'absolute',
    right: 18
  },
  featuredTime: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6
  },
  featuredTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10
  },
  hubCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 110,
    padding: 18
  }
});


