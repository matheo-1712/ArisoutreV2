const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const inventoryViewer = require('mineflayer-web-inventory');
const armorManager = require('mineflayer-armor-manager');
const {monuments} = require('./data/monument.json');

const bot = mineflayer.createBot({
  host: 'antredesloutres.online',
  username: 'Arisoutre',
  auth: 'microsoft',
});

bot.loadPlugin(pathfinder, armorManager);

bot.once('spawn', () => {
  const defaultMove = new Movements(bot);

  defaultMove.allow1by1towers = true;
  defaultMove.canDig = false;
  bot.pathfinder.setMovements(defaultMove);

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const target = bot.players[username] ? bot.players[username].entity : null;

    if (message === '*viens') {
      if (!target) {
        bot.chat('Je ne vous vois pas !');
        return;
      }
      const p = target.position;
      bot.pathfinder.setGoal(new goals.GoalNear(p.x, p.y, p.z, 1));
      bot.chat('Je viens !');
    }

    if (message === '*follow') {
      // Le bot commence à suivre l'utilisateur qui envoie le message
      targetUsername = username;
      const target = bot.players[targetUsername] ? bot.players[targetUsername].entity : null;

      if (!target) {
        console.log(`Le joueur ${targetUsername} n'est pas en ligne.`);
        return;
      }

      const goal = new goals.GoalFollow(target, 3);  // 3 est la distance minimale à maintenir
      bot.pathfinder.setGoal(goal, true);

      bot.chat(`Je suis en train de suivre ${targetUsername}.`);
    }
    if (message.startsWith('*follow')) {
      // Commande pour suivre une personne spécifique : *follow [nom_utilisateur]
      const args = message.split(' ');
      if (args.length === 2) {
        targetUsername = args[1];
        const target = bot.players[targetUsername]?.entity;

        if (!target) {
          console.log(`Le joueur ${targetUsername} n'est pas en ligne.`);
          return;
        }

        const goal = new goals.GoalFollow(target, 3);  // 3 est la distance minimale à maintenir
        bot.pathfinder.setGoal(goal, true);

        bot.chat(`Je suis en train de suivre ${targetUsername}.`);
      }
    }
    if (message === '*stop') {
      // Le bot arrête de suivre
      targetUsername = '';
      bot.pathfinder.setGoal(null);  // Efface l'objectif actuel

      bot.chat('J\'ai arrêté de suivre.');
    }
    if (message === '*vision-me') {
      targetUsername = username;
      // Le bot passe en gm 3
      bot.chat('/gamemode spectator');
      // Le bot se tp a l'utilisateur qui le demande et la ou il regarde
      bot.chat('/tp ' + targetUsername);
      bot.chat('Vue en hauteur http://antredesloutres.online:3008 et vue FPS http://antredesloutres.online:3007');
    }
    if (message.startsWith('*vision')) {
      // Commande pour avoir une vision spécifique d'un monument : *vision [nom_monument]
      const args = message.split(' ');
      if (args.length === 2) {
        const targetMonument = args[1];
    
        // Vérifie si le monument demandé existe dans le JSON
        if (monuments[targetMonument]) {
          const coordinates = monuments[targetMonument].coordonnees.split(', ');
          const [x, y, z] = coordinates;
    
          // Le bot passe en gamemode 3
          bot.chat('/gamemode spectator');
    
          // Le bot se téléporte aux coordonnées du monument demandé
          bot.chat(`/tp ${x} ${y} ${z}`);
    
          // Message indiquant où trouver la vue en hauteur et la vue FPS
          bot.chat('Vue en hauteur http://antredesloutres.online:3008 et vue FPS http://antredesloutres.online:3007');
        } else {
          // Message si le monument demandé n'existe pas dans le JSON
          bot.chat('Monument non trouvé. Veuillez vérifier le nom du monument. Utilisez *monuments pour avoir la liste des monuments disponibles.');
        }
      }
    }
    if (message === '*monuments') {
      // Envoie la liste des monuments disponibles
      bot.chat('Monuments disponibles : ' + Object.keys(monuments).join(', '));
    }

    if (message === '*stopvision') {
      // Le bot repasse en gm 0
      bot.chat('/gamemode creative');
      // Le bot se tp a l'utilisateur qui le demande et la ou il regarde
      bot.chat('/tp 0 100 0');
    }
  });

  bot.on('path_done', () => {
    bot.chat('J\'ai atteint mon objectif !');
  });
});

bot.once('spawn', () => {
  inventoryViewer(bot, { port: 3009 });
  mineflayerViewer(bot, { port: 3007, firstPerson: true });
  mineflayerViewer(bot, { port: 3008, firstPerson: false });
});

bot.on('kicked', console.log);
bot.on('error', console.log);
