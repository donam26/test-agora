import ClientOnly from '../components/ClientOnly';
import VideoCallComponent from '../components/VideoCallComponent';

export default function Home() {
  return (
    <ClientOnly>
      <VideoCallComponent />
    </ClientOnly>
  );
}
