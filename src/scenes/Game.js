import Phaser from '../lib/phaser.js'
import Carrot from '../game/Carrot.js'

export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.Sprite} */
  player  
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors
  /** @type {Phaser.Physics.Arcade.Group} */
  carrots
  carrotsCollected
  /** @type {Phaser.GameObjects.Text} */
  carrotsCollectedText

  constructor(){
    super('game') // unique key for this scene
  }

  init(){
    this.carrotsCollected = 0
  }

  preload(){
    this.load.image('background', 'src/assets/bg_layer1.png')
    this.load.image('platform', 'src/assets/ground_grass.png')

    this.load.image('bunny-stand', 'src/assets/bunny1_stand.png')
    this.load.image('bunny-jump', 'src/assets/bunny1_jump.png')

    this.load.image('carrot', 'src/assets/carrot.png')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create(){
    // background
    this.add.image(240, 320, 'background')
      .setScrollFactor(1, 0)

    // carrots
    this.carrots = this.physics.add.group({
      classType: Carrot
    })

    // platforms
    this.platforms = this.physics.add.staticGroup()
    
    for (let i = 0; i < 5; ++i){
      const x = Phaser.Math.Between(80, 400)
      const y = 150 * i
      
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, 'platform')
      platform.scale = .5
      
      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body
      body.updateFromGameObject()
      
      if (i % 2 !== 0){
        this.addCarrotAbove(platform)
      }
    }
    
    // player
    this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
    .setScale(.5)
  
    // collision
    this.physics.add.collider(this.platforms, this.player)
    this.physics.add.collider(this.platforms, this.carrots)
  
    // overlap
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined, // processCB
      this // cbContext
    )
    
    // player collides only with it's bottom
    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.left = false
    this.player.body.checkCollision.right = false
    
    // camera
    this.cameras.main.startFollow(this.player)
    
    this.cameras.main.setDeadzone(this.scale.width * 1.5)

    // carrot counter
    const style = { color: '#000000', fontSize: 24 }
    this.carrotsCollectedText = this.add.text(240, 10, `Carrots: ${this.carrotsCollected}`, style)
      .setScrollFactor(0)
      .setOrigin(.5, 0)
  }
    
  update(){
    // move bottom platforms to top
    this.platforms.children.iterate(child => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child
      
      const scrollY = this.cameras.main.scrollY
      if (platform.y >= scrollY + 700){
        platform.y = scrollY - Phaser.Math.Between(50, 100)
        platform.body.updateFromGameObject()
        this.addCarrotAbove(platform)
      }
    })

    const touchingDown = this.player.body.touching.down
    if (touchingDown){
      this.player.setVelocityY(-300) // player jump straight up
    }

    const { left, right } = this.cursors
    if (left.isDown && !touchingDown){
      this.player.setVelocityX(-200)
    } else if (right.isDown && !touchingDown){
      this.player.setVelocityX(200)
    } else {
      this.player.setVelocityX(0)
    }

    // player wrap
    this.horizontalWrap(this.player)

    // clean up fallen carrots
    this.carrots.children.iterate((carrot, i) => {
      if (carrot.y > this.cameras.main.scrollY + 700 + carrot.displayHeight){
        this.carrots.killAndHide(carrot) // hide from display
        this.physics.world.disableBody(carrot.body) // disable from physics world
      }
    })

    // handle game over
    if (this.findBottomMostPlatform().y + 200 < this.player.y){
      this.scene.start('game-over')
    }
  }

  /**
   * @param {Phaser.GameObjects.Sprite} Sprite
   */
  horizontalWrap(sprite){
    const halfW = sprite.displayWidth / 2,
          gameW = this.scale.width

    if (sprite.x < -halfW){
      sprite.x = gameW + halfW
    } else if (sprite.x > gameW + halfW){
      sprite.x = -halfW
    }
  }

  /**
   * @param {Phaser.GameObjects.Sprite} Sprite
   */
  addCarrotAbove(sprite){
    const y = sprite.y - sprite.displayHeight
    const carrot = this.carrots.get(sprite.x, y, 'carrot')

    carrot.setActive(true)
    carrot.setVisible(true)

    this.add.existing(carrot)
    carrot.body.setSize(carrot.width, carrot.height)

    this.physics.world.enable(carrot)

    return carrot
  }

  /**
   * @param {Phaser.GameObjects.Sprite} player
   * @param {Phaser.GameObjects.Sprite} carrot
   */
  handleCollectCarrot(player, carrot){
    this.carrots.killAndHide(carrot) // hide from display
    this.physics.world.disableBody(carrot.body) // disable from physics world

    // add to carrotsCollected
    this.carrotsCollected++

    const txt = `Carrots: ${this.carrotsCollected}`
    this.carrotsCollectedText.text = txt
  }

  /**
   * 
   */
  findBottomMostPlatform(){
    return this.platforms.getChildren().reduce((bottom, current, i) => {
      if (bottom){

        if (bottom.y < current.y){ return current }
        else { return bottom }

      } else {

        return current
      }
    }, null)
  }
}

