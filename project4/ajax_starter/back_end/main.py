from typing import Mapping, Any, List, Tuple
import os
import json
from http_daemon import delay_open_url, serve_pages

#the player class will be used to store the individual player id and (x,y) coords:
class Player:
    def __init__(self, Id:str, x:int, y:int):
        self.Id = Id
        self.x = 0
        self.y = 0
        self.playerName = ""
        self.hist = 0

#defining an empty player dictionary:
playerdict: dict[str, Player] = {}
history: list[Player] = []
#find_player function iterates over the dictionary and returns the player object
def find_player(Id: str) -> Player:
    if Id in playerdict:
            player = playerdict[Id]
            return player
    else:
        player = Player(Id, 0, 0)
        playerdict[Id] = player  
        return player
    
map: Mapping[str, Any] = {}

def load_map() -> None:
  global map
  with open('map.json', 'rb') as f:
      s = f.read()
  map = json.loads(s)

load_map()

def make_ajax_page(params: Mapping[str, Any]) -> Mapping[str, Any]:
    action = params['action']
    if params['action'] == 'click':
        player = find_player(params['Id'])
        player.x = params['x']
        player.y = params['y']
        player.playerName = params['playerName']
        history.append(player)
    elif params['action'] == 'getUpdate':
        player = find_player(params['Id'])
        remaining_history = history[player.hist:]
        player.hist = len(history)
        updates: List[Tuple[str, int, int,str]] = []
        for i in range(len(remaining_history)):
            player = remaining_history[i]
            updates.append((player.Id, player.x, player.y,player.playerName))
        return {
            'updates': updates
        }
    elif params['action'] == 'get_map':
        return {
            'status': 'map',
            'map': map,

        }
        
    print(f'make_ajax_page was called with {params}')
    return {
        'message': 'yo momma',

    }
    
def main() -> None:
    # Get set up
    os.chdir(os.path.join(os.path.dirname(__file__), '../front_end'))

    # Serve pages
    port = 8987
    delay_open_url(f'http://127.0.0.1:{port}/game.html', .1)
    serve_pages(port, {
        'ajax.html': make_ajax_page,
    })

if __name__ == "__main__":
    main()
