Feature: Fusión de datos de personajes

  Como usuario autenticado, quiero obtener datos combinados de un personaje
  para tener una vista completa de su información, optimizando con un sistema de caché.

  Scenario: Obtener datos fusionados cuando existen en caché (Cache HIT)
    Given que los datos del personaje "1" existen en el caché
    When solicito los datos fusionados para el personaje "1"
    Then el sistema devuelve los datos directamente desde el caché
    And no se realizan llamadas a las APIs externas de SWAPI

  Scenario: Obtener datos fusionados cuando no existen en caché (Cache MISS)
    Given que los datos del personaje "1" no existen en el caché
    And las APIs externas de SWAPI devuelven datos válidos para el personaje y su planeta
    When solicito los datos fusionados para el personaje "1"
    Then el sistema obtiene los datos de las APIs externas
    And los datos fusionados se guardan en el caché para futuras solicitudes
    And los datos fusionados se guardan en el historial de DynamoDB

  Scenario: Obtener el historial de fusiones
    Given que existen datos en el historial de fusiones
    When solicito el historial sin un punto de paginación
    Then el sistema devuelve una lista de items y una clave para la siguiente página
