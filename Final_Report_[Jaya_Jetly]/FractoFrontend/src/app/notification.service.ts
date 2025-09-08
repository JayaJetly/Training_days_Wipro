import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;
  private notificationSubject = new Subject<string>();
  public notification$ = this.notificationSubject.asObservable();

  constructor() { }

  public async startConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR Connection already started.');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5029/notificationHub')
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR Connection started!');
    } catch (err) {
      console.error('Error while starting SignalR connection: ' + err);
      setTimeout(() => this.startConnection(), 5000); // Retry connection after 5 seconds
    }
  }

  public addNotificationListener(): void {
    if (!this.hubConnection) {
      console.error('HubConnection is not initialized. Call startConnection() first.');
      return;
    }
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      console.log('Notification received: ', message);
      this.notificationSubject.next(message);
    });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      console.log('SignalR Connection stopped.');
      this.hubConnection = null; // Clear the connection
    }
  }
}