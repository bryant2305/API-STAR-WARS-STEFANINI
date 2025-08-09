Feature: Almacenar datos personalizados

  Como usuario autenticado, quiero poder almacenar datos personalizados
  para guardar información relevante en el sistema.

  Scenario: Creación exitosa de un nuevo dato personalizado
    Given un DTO con datos válidos para crear un recurso
    When el servicio intenta crear el recurso
    Then el recurso es creado exitosamente
    And el resultado devuelto contiene un "id" y una "fecha_creacion"
    And el servicio de base deatos es invocado para guardar el item
