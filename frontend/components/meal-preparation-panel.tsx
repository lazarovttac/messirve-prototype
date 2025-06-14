"use client"

import { useState } from "react"
import { format } from "date-fns"
import { AlertCircle, ChefHat, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FoodIcon } from "@/components/food-icon"

export function MealPreparationPanel({ reservations }) {
  const [view, setView] = useState("meals")

  // Extract all meals from reservations and sort by urgency
  const allMeals = reservations.flatMap((reservation) =>
    reservation.meals.map((meal) => ({
      ...meal,
      customer: reservation.customer,
      table: reservation.table,
      time: reservation.time,
      reservationId: reservation.id,
    })),
  )

  // Sort meals by status priority: urgent > in-progress > upcoming > pending > completed
  const statusPriority = {
    urgent: 0,
    "in-progress": 1,
    upcoming: 2,
    pending: 3,
    completed: 4,
  }

  const sortedMeals = [...allMeals].sort((a, b) => {
    // First sort by status priority
    const statusDiff = statusPriority[a.status] - statusPriority[b.status]
    if (statusDiff !== 0) return statusDiff

    // Then sort by prep time (longer prep times first for same status)
    const prepTimeDiff = b.prepTime - a.prepTime
    if (prepTimeDiff !== 0) return prepTimeDiff

    // Finally sort by reservation time
    return a.time.getTime() - b.time.getTime()
  })

  // Group meals by table
  const mealsByTable = reservations.reduce((acc, reservation) => {
    if (!acc[reservation.table]) {
      acc[reservation.table] = {
        table: reservation.table,
        meals: [],
      }
    }

    reservation.meals.forEach((meal) => {
      acc[reservation.table].meals.push({
        ...meal,
        customer: reservation.customer,
        time: reservation.time,
        reservationId: reservation.id,
      })
    })

    return acc
  }, {})

  const tableData = Object.values(mealsByTable).sort((a: any, b: any) => {
    // Sort tables by most urgent meal
    const aUrgency = Math.min(...a.meals.map((m) => statusPriority[m.status]))
    const bUrgency = Math.min(...b.meals.map((m) => statusPriority[m.status]))
    return aUrgency - bUrgency
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "urgent":
        return (
          <Badge variant="destructive" className="rounded-lg">
            Urgent
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="rounded-lg">
            In Progress
          </Badge>
        )
      case "upcoming":
        return (
          <Badge variant="outline" className="rounded-lg">
            Upcoming
          </Badge>
        )
      case "completed":
        return <Badge className="bg-status-completed text-white rounded-lg">Completed</Badge>
      default:
        return (
          <Badge variant="outline" className="rounded-lg">
            Pending
          </Badge>
        )
    }
  }

  const getProgressValue = (status) => {
    switch (status) {
      case "completed":
        return 100
      case "in-progress":
        return 50
      case "urgent":
        return 25
      case "upcoming":
        return 10
      default:
        return 0
    }
  }

  return (
    <Card className="shadow-md rounded-2xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          Meal Preparation
        </CardTitle>
        <CardDescription>{sortedMeals.filter((m) => m.status !== "completed").length} meals to prepare</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="meals" onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl mb-4">
            <TabsTrigger value="meals" className="rounded-lg">
              By Meal
            </TabsTrigger>
            <TabsTrigger value="tables" className="rounded-lg">
              By Table
            </TabsTrigger>
          </TabsList>
          <TabsContent value="meals" className="mt-0">
            <div className="space-y-4">
              {sortedMeals.filter((meal) => meal.status !== "completed").length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No meals to prepare</div>
              ) : (
                sortedMeals
                  .filter((meal) => meal.status !== "completed")
                  .map((meal, index) => (
                    <div key={index} className="border rounded-xl p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FoodIcon foodType={meal.name} size="sm" />
                          <div className="font-medium">{meal.name}</div>
                        </div>
                        {getStatusBadge(meal.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Table {meal.table}</span>
                        <span>•</span>
                        <span>{meal.customer}</span>
                        <span>•</span>
                        <span>{format(meal.time, "h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{meal.prepTime} min prep time</span>
                      </div>
                      <Progress value={getProgressValue(meal.status)} className="h-2 rounded-lg" />
                      {meal.status === "urgent" && (
                        <div className="flex items-center gap-1 text-status-urgent text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>Start preparation now!</span>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="tables" className="mt-0">
            <div className="space-y-4">
              {tableData.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No tables with meals to prepare</div>
              ) : (
                tableData.map((tableInfo: any, index) => (
                  <div key={index} className="border rounded-xl p-3 space-y-2 shadow-sm">
                    <div className="font-medium">Table {tableInfo.table}</div>
                    <div className="space-y-2 mt-2">
                      {tableInfo.meals
                        .filter((meal) => meal.status !== "completed")
                        .sort((a, b) => statusPriority[a.status] - statusPriority[b.status])
                        .map((meal, mealIndex) => (
                          <div key={mealIndex} className="flex items-center justify-between text-sm border-t pt-2">
                            <div className="flex items-center gap-2">
                              <FoodIcon foodType={meal.name} size="sm" />
                              <span>{meal.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{meal.prepTime} min</span>
                              {getStatusBadge(meal.status)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
