import { Injectable, signal, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

export interface NewStoriesNotification {
  count: number;
  stories: Story[];
  timestamp: string;
}

export interface Story {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  
  public readonly apiUrl = 'http://localhost:5000';

  // Signals for reactive state
  public readonly connectionState = signal<HubConnectionState>(HubConnectionState.Disconnected);
  public readonly newStoriesAvailable = signal<NewStoriesNotification | null>(null);
  public readonly isConnected = signal<boolean>(false);

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/newsHub`, {
        withCredentials: false // Set to true if you need authentication
      })
      .withAutomaticReconnect()
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Handle connection state changes
    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      this.connectionState.set(HubConnectionState.Disconnected);
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionState.set(HubConnectionState.Reconnecting);
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectionState.set(HubConnectionState.Connected);
      this.isConnected.set(true);
    });

    // Handle new stories notification
    this.hubConnection.on('NewStoriesAvailable', (notification: NewStoriesNotification) => {
      console.log('Received new stories notification:', notification);
      this.newStoriesAvailable.set(notification);
    });
  }

  public async startConnection(): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state === HubConnectionState.Connected) {
      return;
    }

    try {
      await this.hubConnection.start();
      console.log('SignalR connection started');
      this.connectionState.set(HubConnectionState.Connected);
      this.isConnected.set(true);

      // Join the news updates group
      await this.hubConnection.invoke('JoinNewsUpdates');
      console.log('Joined news updates group');
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionState.set(HubConnectionState.Disconnected);
      this.isConnected.set(false);
      throw error;
    }
  }

  public async stopConnection(): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state === HubConnectionState.Disconnected) {
      return;
    }

    try {
      await this.hubConnection.stop();
      console.log('SignalR connection stopped');
      this.connectionState.set(HubConnectionState.Disconnected);
      this.isConnected.set(false);
    } catch (error) {
      console.error('Error stopping SignalR connection:', error);
      throw error;
    }
  }

  public async joinNewsUpdates(): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await this.hubConnection.invoke('JoinNewsUpdates');
      console.log('Joined news updates group');
    } catch (error) {
      console.error('Error joining news updates group:', error);
      throw error;
    }
  }

  public async leaveNewsUpdates(): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await this.hubConnection.invoke('LeaveNewsUpdates');
      console.log('Left news updates group');
    } catch (error) {
      console.error('Error leaving news updates group:', error);
      throw error;
    }
  }

  public clearNewStoriesNotification(): void {
    this.newStoriesAvailable.set(null);
  }

  public getConnectionState(): HubConnectionState {
    return this.hubConnection?.state || HubConnectionState.Disconnected;
  }

  public async ngOnDestroy(): Promise<void> {
    await this.stopConnection();
  }
}