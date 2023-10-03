

//drag and drop d'un token sur le formulaire

//placer un token qui etait hors de la map -> verifier que l'emplacement est libre
//faire une zone "jardins secrets" ou sont les pions non





//Aller dans jardin : supprimer la position dans l'arbre

//actor.position arbre: null si jardin ou pas placé


  
/*Hook pour le Chat message requete comédien.*/
Hooks.on('renderChatMessage', async (chatItem, html, data) => {
    const flagDataArray = await chatItem.getFlag(game.system.id, 'applyEffects');
    
    if (flagDataArray && game.user.isGM) {
      await html.find('#applyEffect').click(async () => {
        for (let flagData of flagDataArray) {
          if (flagData.tokenId || flagData.actorId) {
            let token = flagData.tokenId ? canvas.tokens.objects.children.find((token) => token.id === flagData.tokenId) : null;
            if (token !== undefined) {
              if (flagData.addEffect) {
                await modifyEffectOnToken(token, flagData.addEffect, 1, flagData);
              }
              if (flagData.removeEffect) {
                await modifyEffectOnToken(token, flagData.removeEffect, 0, flagData);
              }
              if (flagData.modifyEffectDuration) {
                await modifyEffectOnToken(token, flagData.modifyEffectDuration, 2, flagData);
              }
              if (flagData.defeated && ui.combat.viewed) {
                let c = ui.combat.viewed.getCombatantByToken(flagData.tokenId);
                ui.combat._onToggleDefeatedStatus(c);
              }
            }
            let actor = token?.actor ?? game.actors.get(flagData.actorId);
            if (actor !== undefined) {
              if (flagData.toughnessChange) {
                let newToughness = Math.max(0, Math.min(actor.system.health.toughness.max, actor.system.health.toughness.value + flagData.toughnessChange));
                await actor.update({ 'system.health.toughness.value': newToughness });
              }
              if (flagData.attributeChange) {
                let newMod = actor.system.attributes[flagData.attributeName].temporaryMod + flagData.attributeChange;
                let linkMod = 'system.attributes.' + flagData.attributeName + '.temporaryMod';
                await actor.update({ [linkMod]: newMod });
              }
              if (flagData.corruptionChange) {
                let newCorruption = actor.system.health.corruption.temporary + flagData.corruptionChange;
                await actor.update({ 'system.health.corruption.temporary': newCorruption });
              }
              if (flagData.addObject) {
                if (flagData.addObject == 'blessedshield') {
                  await createBlessedShield(actor, flagData.protection);
                }
              }
            }
          }
        }
        await chatItem.unsetFlag(game.system.id, 'applyEffects');
        await chatItem.delete();
        return;
      });
    }
    const functionStuff = await chatItem.getFlag(game.system.id, 'resistRoll');
    if (functionStuff) {
      await html.find('#applyEffect').click(async () => {
        let tok = canvas.tokens.objects.children.find((token) => token.id === functionStuff.tokenId);
        let targetToken = canvas.tokens.objects.children.find((token) => token.id === functionStuff.targetData.tokenId);
        if (tok === undefined || targetToken === undefined) {
          ui.notifications.error("Can't find token.");
          return;
        }
        functionStuff.token = tok;
        functionStuff.actor = tok.actor;
        functionStuff.targetData.token = targetToken;
        functionStuff.targetData.actor = targetToken.actor;
        // game.symbaroum.log("from hook: ", functionStuff);
        buildRolls(functionStuff);
        await chatItem.unsetFlag(game.system.id, 'resistRoll');
        return;
      });
    }
  });