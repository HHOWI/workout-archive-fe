import { io, Socket } from "socket.io-client";
import { NotificationDTO } from "../dtos/NotificationDTO";

// 소켓 이벤트 타입
export enum SocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  AUTHENTICATE = "authenticate",
  NEW_NOTIFICATION = "new_notification",
  NOTIFICATION_READ = "notification_read",
  ERROR = "error",
}

// 소켓 상태 타입
export enum SocketStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  ERROR = "error",
  AUTHENTICATED = "authenticated",
}

class SocketService {
  private socket: Socket | null = null;
  private status: SocketStatus = SocketStatus.DISCONNECTED;
  private notificationHandlers: ((notification: NotificationDTO) => void)[] =
    [];
  private statusChangeHandlers: ((status: SocketStatus) => void)[] = [];

  // 싱글톤 인스턴스
  private static instance: SocketService;

  // 싱글톤 인스턴스 가져오기
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // 소켓 연결
  public connect(
    backendUrl: string = process.env.REACT_APP_API_URL ||
      "http://localhost:3000"
  ): void {
    if (this.socket) {
      this.disconnect();
    }

    this.setStatus(SocketStatus.CONNECTING);

    this.socket = io(backendUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      withCredentials: true,
    });

    this.setupSocketListeners();
  }

  // 소켓 이벤트 리스너 설정
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on(SocketEvent.CONNECT, () => {
      console.log("소켓 연결됨");
      this.setStatus(SocketStatus.CONNECTED);
      this.authenticate();
    });

    this.socket.on(SocketEvent.DISCONNECT, () => {
      console.log("소켓 연결 해제됨");
      this.setStatus(SocketStatus.DISCONNECTED);
    });

    this.socket.on(SocketEvent.ERROR, (error) => {
      console.error("소켓 에러:", error);
      this.setStatus(SocketStatus.ERROR);
    });

    this.socket.on(
      SocketEvent.NEW_NOTIFICATION,
      (data: { notification: NotificationDTO }) => {
        console.log("새 알림 수신:", data.notification);
        this.notificationHandlers.forEach((handler) =>
          handler(data.notification)
        );
      }
    );
  }

  // 인증 처리 - 토큰 파라미터 없이 쿠키 사용
  public authenticate(): void {
    if (!this.socket || this.status !== SocketStatus.CONNECTED) {
      console.error("소켓이 연결되지 않았습니다.");
      return;
    }

    this.socket.emit(SocketEvent.AUTHENTICATE, {});
    this.setStatus(SocketStatus.AUTHENTICATED);
    console.log("소켓 인증 요청 전송");
  }

  // 소켓 연결 해제
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setStatus(SocketStatus.DISCONNECTED);
  }

  // 상태 변경 핸들러 추가
  public addStatusChangeHandler(handler: (status: SocketStatus) => void): void {
    this.statusChangeHandlers.push(handler);
  }

  // 상태 변경 핸들러 제거
  public removeStatusChangeHandler(
    handler: (status: SocketStatus) => void
  ): void {
    this.statusChangeHandlers = this.statusChangeHandlers.filter(
      (h) => h !== handler
    );
  }

  // 알림 핸들러 추가
  public addNotificationHandler(
    handler: (notification: NotificationDTO) => void
  ): void {
    this.notificationHandlers.push(handler);
  }

  // 알림 핸들러 제거
  public removeNotificationHandler(
    handler: (notification: NotificationDTO) => void
  ): void {
    this.notificationHandlers = this.notificationHandlers.filter(
      (h) => h !== handler
    );
  }

  // 소켓 상태 설정
  private setStatus(status: SocketStatus): void {
    this.status = status;
    this.statusChangeHandlers.forEach((handler) => handler(status));
  }

  // 현재 소켓 상태 반환
  public getStatus(): SocketStatus {
    return this.status;
  }

  // 소켓 인스턴스 반환
  public getSocket(): Socket | null {
    return this.socket;
  }
}

export default SocketService;
