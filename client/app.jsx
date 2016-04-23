import React from 'react';
import Nav from './nav.js';
import SongPlayer from './songplayer.jsx';
import CardsContainer from './cardsContainer.jsx';
import AppBar from 'react-toolbox/lib/app_bar';
import queryAll from './queryAll.js';
import Button from 'react-toolbox/lib/button';
import ChatBox from './chatBox.jsx'
import io from 'socket.io-client';
import PlayList from './playList.jsx';
import { Layout, NavDrawer, Panel, Sidebar, IconButton} from 'react-toolbox';
import socket from './websockets.js';
import LoginModal from './LoginModal.jsx';
import VotingComponent from './VotingComponent.jsx';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temperature: 0,
      username: '',
      userId: '',
      dictator: '',
      isDictator: false,
      mood: 1,

      tracks: [
        {
          artist: 'Yeezy',
          apiSource: 'test',
        },
      ],
      currentTrack: {
        artist: 'Yeezy',
        apiSource: 'test',
      },
      searching: false,
      sidebarPinned: false,
    };
  }

  // add something that alters role in state

  componentDidMount() {
    socket.on('user joined', (username) => {
      this.setState(
        { username: username,
          userId: socket.id });
    });
    socket.on('assign dictator', () => {
      console.log('i am dictator', this.state.userId);
      // toggle a dictator symbol on the screen
      this.setState({
        isDictator: true,
        dictator: this.state.username,
      });
    });

    socket.on('update track', (track) => {
      this.handleCardPlay(track);
    });

    socket.on('temperatureUpdate', (temp) => {
      console.log('setTem', temp);
      this.setState({ temperature: temp.temperature });
    });

    const self = this;
    queryAll({ query: 'Kanye',
      })
      .then((results) => {
        console.log(results);
        self.setState({
          tracks: results,
        });
      });
  }

  handleCardPlay(track) {
    this.setState({
      currentTrack: track,
    });
  }

  handleSearch(value) {
    const self = this;
    if (value === null) {
      this.setState({
        searching: false,
      });
    }
    this.setState({
      searching: true,
    });
    queryAll({ query: value })
      .then((results) => {
        self.setState({
          tracks: results,
          searching: false,
        });
      });
  }

  toggleSidebar() {
    this.setState({ sidebarPinned: !this.state.sidebarPinned});
    this.setState({temperature: this.state.temperature+20})
  }

  moodHandler(sentiment) {
    var mood = this.state.mood; // 0 or 1
    if (mood !== sentiment) {
      var oppositeMood = !!sentiment ? 1 : 0;
      this.setState({ mood: oppositeMood });
      socket.emit('mood change', this.state.mood);
    }
  }

  render() {
    return (
      <div>
        <Layout className='layout'>
          <AppBar className="appBar" >
            <div>
            <div className='dictatorIs'>The ruling music dictator is {this.state.dictator}</div>
            <Button label="Like"  icon='favorite' accent onClick={ () => this.moodHandler(0) } />
            <Button label="Overthrow" onClick={ () => this.moodHandler(1) } />
            </div>
            <SongPlayer track = {this.state.currentTrack} />
            <span className='chatButton'><Button icon={this.state.sidebarPinned ? 'close' : 'inbox'} label='Chat' onClick={ this.toggleSidebar.bind(this) }/></span>
          </AppBar>
          <NavDrawer active={true}
                    pinned={true}
                    className='navDrawer'
                    >
            <PlayList temperature={this.state.temperature} handleCardPlay = {this.handleCardPlay.bind(this)} />
          </NavDrawer>
            <Panel>
          <Nav className="searchBar" handleSearch = { this.handleSearch.bind(this) } searching={ this.state.searching } />
          <Button label="Like"  icon='favorite' accent onClick={ () => this.moodHandler(0) } />
          <Button label="Not so much" onClick={ () => this.moodHandler(1) } />
            <CardsContainer tracks = {this.state.tracks}
              handleCardPlay = {this.handleCardPlay.bind(this)}
            />
          </Panel>
          <Sidebar className='sideBar' pinned={ this.state.sidebarPinned } width={ 5 }>
            <ChatBox toggleSidebar={this.toggleSidebar.bind(this)} username={this.state.username }/>
          </Sidebar>
          <div><Button icon={this.state.sidebarPinned ? 'close' : 'inbox'} label='Chat' onClick={ this.toggleSidebar.bind(this) }/></div>
      </Layout>
      <LoginModal />
    </div>
    );
  }
}

export default App;
