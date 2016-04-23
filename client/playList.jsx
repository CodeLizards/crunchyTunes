import React from 'react';
import Button from 'react-toolbox/lib/button';
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card';
import ClassNames from 'classnames';
import style from './styles/toolbox-theme';
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list';

import socket from './websockets.js';

class PlayList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [],
      color: 'yellowgreen'      
    };
  }

  componentDidMount() {
    socket.on('new track', (tracks) => {
      this.handleNewTrack(tracks);
    });
    socket.on('remove from playlist', (tracks) => {
      this.setState({ tracks: tracks });
    });
  }

  handleNewTrack(tracks) {
    this.setState({ tracks: tracks });
  }

  handleTrackEmit(track) {
    socket.emit('track play', track);
  }


  componentWillReceiveProps (nextProps) {
    console.log('next Props', this.props);
    if(nextProps.temperature >= 99){
      this.setState({color: '#F43636'})
    } else if (nextProps.temperature >= 95) {
      this.setState({color: '#FF5722'});
    } else if (nextProps.temperature >= 80) {
      this.setState({color: '#F49636'});
    } else if(nextProps.temperature >= 50){
      this.setState({color: '#FFE007'});
    } else {
      this.setState({color: '#8BC34A'});
      
    }
  }




  render() {  

    return (
      <List selectable ripple className="list">
        <ListSubHeader caption="Dictator's Playlist" />
         <div style={{width: this.props.temperature*2.2, backgroundColor: this.state.color, maxWidth: '280px'}} className='temperature'></div>
         {this.state.tracks.map((track) =>
          <ListItem
            caption={`${track.songTitle}\n${track.creator}`}
            avatar={track.imagePath}
            onClick={() => this.handleTrackEmit(track)}
          />

        )}
      </List>
    );
  }
}

export default PlayList;
