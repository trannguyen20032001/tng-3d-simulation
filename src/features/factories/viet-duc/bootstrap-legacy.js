(function () {
  "use strict";
  TNG.areas.buildFloor1(TNG.state);
  TNG.areas.buildFloor2(TNG.state);
  TNG.state.interaction = TNG.core.createInteractionManager(TNG.state);
  TNG.features.setupAgv(TNG.state);
  TNG.features.setupEnvironmentSensors(TNG.state);
  TNG.state.f1.updatePointLights();
  TNG.features.setupSewingTeams(TNG.state);
  const hoverOutline = TNG.features.createHoverOutline(TNG.state.f1);
  TNG.state.agv.agents.forEach((agent) => hoverOutline.register(agent.robot));
  TNG.state.environmentSensors.sensors.forEach((sensor) => hoverOutline.register(sensor.sensor));
  TNG.state.hoverOutline = hoverOutline;
  TNG.features.setupSlideshow(TNG.state);
  TNG.features.restorePreferences();
})();
